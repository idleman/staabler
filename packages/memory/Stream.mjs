import autobind from '@staabler/core/autobind.mjs';
import ConditionVariable from './ConditionVariable.mjs';

/**
 * Validates that a buffer length is valid for stream operations.
 * Buffer length must be divisible by 2 for proper stream functionality.
 * 
 * @param {number} [byteLength=0] - The byte length to validate
 * @returns {number} The validated byte length
 * @throws {Error} If the byte length is not divisible by 2
 */
function assertBufferLength(byteLength = 0) {
  if(!(byteLength && byteLength%2 === 0)) {
    throw new Error(`The provided buffer must have a length dividable by 2 (got=${byteLength})`);
  }
  return byteLength;
}

/**
 * A lock-free memory queue implementation using a circular buffer.
 * Provides high-performance data transfer between threads without mutexes.
 * Uses an empty slot to differentiate between full and empty states.
 * Reference: https://embeddedartistry.com/blog/2017/05/17/creating-a-circular-buffer-in-c-and-c/
 */
export default class Stream {

  /**
   * Creates a new Stream instance on top of an ArrayBuffer/SharedArrayBuffer.
   * Does not use mutexes - external synchronization must be added if needed.
   * 
   * @param {ArrayBuffer|SharedArrayBuffer} buffer - The underlying buffer
   * @param {number} [byteOffset=0] - Byte offset within the buffer
   * @param {number} [byteLength=Infinity] - Maximum byte length for the stream
   */
  constructor(buffer, byteOffset = 0, byteLength = Infinity) {
    autobind(this); 
    this.buffer = buffer;
    this.byteOffset = byteOffset;
    this.meta = new Uint32Array(buffer, this.byteOffset, 3); // [head, tail, status]
    this.array = new Uint8Array(buffer, this.meta.byteOffset + this.meta.byteLength, Math.min(byteLength, buffer.byteLength - this.meta.byteLength - this.meta.byteOffset));
    this.byteLength = this.meta.byteLength + this.array.byteLength;
    
    
    assertBufferLength(this.meta.byteLength);
    assertBufferLength(this.array.byteLength);

    this.length = this.array.length - 1;
    
    this.head = new ConditionVariable(this.buffer, this.byteOffset);
    this.tail = new ConditionVariable(this.buffer, this.byteOffset + 4);
  }

  /**
   * Checks if the stream is empty.
   * 
   * @returns {boolean} True if the stream is empty, false otherwise
   */
  isEmpty() {
    const meta = this.meta;
    return Atomics.load(meta, 0) === Atomics.load(meta, 1);
  }
  
  /**
   * Returns the current capacity of the stream (number of bytes that can be stored).
   * 
   * @returns {number} The capacity of the stream in bytes
   */
  capacity() {
    return this.array.length - this.size() - 1;
  }

  /**
   * Returns the current number of bytes in the stream.
   * 
   * @returns {number} The number of bytes in the stream
   */
  size() {
    const meta = this.meta;
    const head = Atomics.load(meta, 0);
    const tail = Atomics.load(meta, 1);
    
    return  (head == tail) ? 0 :
            (tail < head) ? this.array.length - head + tail :
            (tail - head);
  }

  /**
   * Peeks at a byte at the specified position without removing it.
   * 
   * @param {number} [pos=0] - Position to peek at (0 = front of stream)
   * @returns {number|undefined} The byte at the position or undefined if out of bounds
   */
  peek(pos = 0) {
    const meta = this.meta;
    const array = this.array;
    const length = array.length;
    const head = Atomics.load(meta, 0);
    const tail = Atomics.load(meta, 1);
    const size =  (head == tail) ? 0 :
                  (tail < head) ? length - head + tail :
                  (tail - head);
    return (pos < 0 || size <= pos) ? void(0) : array.at(((head + pos)%length));
  }

  /**
   * Scans N bytes forward from the current head position.
   * 
   * @param {number} [bytes=0] - Number of bytes to scan
   * @returns {Array|undefined} Array of scanned bytes or undefined if not enough data
   */
  scan(bytes = 0) {
    const meta = this.meta;
    const array = this.array;
    const length = array.length;
    const head = Atomics.load(meta, 0);
    const tail = Atomics.load(meta, 1);
    const size =  (head == tail) ? 0 :
                  (tail < head) ? length - head + tail :
                  (tail - head);
    return  (bytes < 0 || size < bytes) ? void(0) :
            Array.from({ length: bytes }, (_, index) => array.at(((head + index)%length)));
  }

  /**
   * Attempts to write data to the stream.
   * 
   * @param {Uint8Array} data - Data to write to the stream
   * @returns {number} Number of bytes written or 0 if write failed
   */
  tryWrite(data) {
    const meta = this.meta;
    const array = this.array;
    const length = array.length;
    const head = Atomics.load(meta, 0);
    const tail = Atomics.load(meta, 1);
    const size =  (head == tail) ? 0 :
                  (tail < head) ? length - head + tail :
                  (tail - head);

    const capacity = length - size - 1;
    const byteLength = data.byteLength;
    if(byteLength <= 0 || capacity < byteLength) {
      return 0;
    }
    
    if(Atomics.add(meta, 2, 1) !== 0) {
      // Some other write is happening
      return 0;
    }

    //  Because we may not be able to write the complete chunk without
    //  crossing the "edge", do we need to figure out how much we can
    //  actually write, before it happens
    
    const next = ((tail + byteLength)%length);
    if(next === 0 || tail < next) {
      array.set(data, tail);
    } else {
      const first = data.subarray(0, array.length - tail);
      array.set(first, tail);
      array.set(data.subarray(first.length));
    }

    Atomics.store(meta, 1, next);
    Atomics.store(meta, 2, 0);
    //this.tail.notifyAll();
    return byteLength;
  }

  /**
   * Writes data to the stream with a timeout.
   * 
   * @param {Uint8Array} data - Data to write to the stream
   * @param {number} [timeout=0] - Timeout in milliseconds (0 = no timeout)
   * @returns {number} Number of bytes written or 0 if timeout occurred
   */
  write(data, timeout = 0) {
    if(timeout === 0) {
      return this.tryWrite(data);
    }

    const meta = this.meta;
    const head = this.head;
    const start = performance.now();
    while(true) {
      const state = Atomics.load(meta, 0);
      const bytesWritten = this.tryWrite(data);
      if(bytesWritten) {
        return bytesWritten;
      }
      const elapsed = performance.now() - start;
      if(timeout < elapsed) {
        return 0;
      }
      head.wait(state, elapsed);
    }
  }

  /**
   * Asynchronously writes data to the stream with a timeout.
   * 
   * @param {Uint8Array} data - Data to write to the stream
   * @param {number} [timeout=0] - Timeout in milliseconds (0 = no timeout)
   * @returns {Promise<number>} Promise that resolves to number of bytes written or 0 if timeout
   */
  async writeAsync(data, timeout = 0) {
    if(timeout === 0) {
      return this.tryWrite(data);
    }

    const meta = this.meta;
    const head = this.head;
    const start = performance.now();
    while(true) {
      const state = Atomics.load(meta, 0);
      const bytesWritten = this.tryWrite(data);
      if(bytesWritten) {
        return bytesWritten;
      }
      const elapsed = performance.now() - start;
      if(timeout < elapsed) {
        return 0;
      }
      await head.waitAsync(state, elapsed);
    }
  }

  /**
   * Attempts to read data from the stream.
   * 
   * @param {Uint8Array} data - Buffer to read data into
   * @returns {number} Number of bytes read or 0 if read failed
   */
  tryRead(data) {
    const meta = this.meta;
    const array = this.array;
    const length = array.length;
    const head = Atomics.load(meta, 0);
    const tail = Atomics.load(meta, 1);
    
    const size =  (head == tail) ? 0 :
                  (tail < head) ? length - head + tail :
                  (tail - head);

    const byteLength = data.byteLength;
    if(byteLength <= 0 || size < byteLength) {
      return 0;
    }

    const next = ((head + byteLength)%length);
    
    if(next === 0 || head < next) {
      data.set(array.subarray(head, head + byteLength));  
    } else {
      const first = array.subarray(head);
      data.set(first);  
      data.set(array.subarray(0, byteLength - first.length), first.length); 
    }
    
    if(Atomics.compareExchange(meta, 0, head, next) === head) {
      // this.head.notifyAll();
      return byteLength;
    }
    return 0;
  }

  /**
   * Sleeps until the stream becomes readable with at least the specified number of bytes.
   * 
   * @param {number} [atleastLength=1] - Minimum number of bytes required to be readable
   * @param {number} [time=Infinity] - Maximum time to wait in milliseconds
   */
  sleepUntilReadable(atleastLength = 1, time = Infinity) {
    const meta = this.meta;
    const array = this.array;
    const length = array.length;
    const start = performance.now();
    while(true) {
      const now = performance.now();
      const elapsed = now - start;
      const wait = time - elapsed;
      if(wait <= 0) {
        return;
      }
      const head = Atomics.load(meta, 0);
      const tail = Atomics.load(meta, 1);
      
      const size =  (head == tail) ? 0 :
                    (tail < head) ? length - head + tail :
                    (tail - head);
      if(atleastLength <= size) {
        return;
      }
      Atomics.wait(meta, 0, tail, wait);
    }
  }

  /**
   * Reads data from the stream with a timeout.
   * 
   * @param {Uint8Array} data - Buffer to read data into
   * @param {number} [timeout=0] - Timeout in milliseconds (0 = no timeout)
   * @returns {number} Number of bytes read or 0 if timeout occurred
   */
  read(data, timeout = 0) {
    if(timeout === 0) {
      return this.tryRead(data);
    }

    const meta = this.meta;
    const tail = this.tail;
    const start = performance.now();
    while(true) {
      const state = Atomics.load(meta, 1);
      const bytesReaded = this.tryRead(data);
      if(bytesReaded) {
        return bytesReaded;
      }
      const elapsed = performance.now() - start;
      if(timeout < elapsed) {
        return 0;
      }
      tail.wait(state, elapsed);
    }
  }

  /**
   * Asynchronously reads data from the stream with a timeout.
   * 
   * @param {Uint8Array} data - Buffer to read data into
   * @param {number} [timeout=0] - Timeout in milliseconds (0 = no timeout)
   * @returns {Promise<number>} Promise that resolves to number of bytes read or 0 if timeout
   */
  async readAsync(data, timeout = 0) {
    if(timeout === 0) {
      return this.tryRead(data);
    }

    const meta = this.meta;
    const tail = this.tail;
    const start = performance.now();
    while(true) {
      const state = Atomics.load(meta, 1);
      const bytesReaded = this.tryRead(data);
      if(bytesReaded) {
        return bytesReaded;
      }
      const elapsed = performance.now() - start;
      if(timeout < elapsed) {
        return 0;
      }
      await tail.waitAsync(state, elapsed);
    }
  }

};