import Stream from './Stream.mjs';
import Record from './Record.mjs';
import autobind from '@staabler/core/autobind.mjs';
import Allocator from '@staabler/core/Allocator.mjs';
import Uint32 from './types/Uint32.mjs';

/**
 * Minimum byte length for packet headers.
 * @type {number}
 */
const kMinHeaderByteLength = 8;

/**
 * Default empty buffer for packet streams.
 * @type {Uint8Array}
 */
const defaultBuffer = new Uint8Array(0);

/**
 * Record type for packet headers containing size and bytes information.
 * @type {Function}
 */
const Header = Record({ size: 'Uint32', bytes: 'Bytes' });

/**
 * A lock-free memory queue for high-performance data transfer between threads.
 * Provides packet-based streaming with automatic header management.
 */
export default class PacketStream {

  /**
   * Creates a new PacketStream instance on top of an ArrayBuffer/SharedArrayBuffer.
   * Does not use mutexes - external synchronization must be added if needed.
   * 
   * @param {ArrayBuffer|SharedArrayBuffer} buffer - The underlying buffer
   * @param {number} [byteOffset=0] - Byte offset within the buffer
   * @param {number} [byteLength=Infinity] - Maximum byte length for the stream
   * @param {Object} [options={}] - Configuration options
   * @param {Allocator} [options.allocator=Allocator.getInstance()] - Memory allocator instance
   * @throws {Error} If buffer length is not divisible by 4
   */
  constructor(buffer, byteOffset = 0, byteLength = Infinity, {
    allocator = Allocator.getInstance()
  } = {}) {
    const maxLength = Math.min(byteLength, buffer.byteLength - byteOffset);
    if(4 < maxLength && maxLength%4 !== 0) {
      throw new Error(`The provided buffer must have a length dividable by 4 (got=${byteLength})`);
    }
    autobind(this);
    this.buffer = buffer;
    this.allocator = allocator;
    this.byteOffset = byteOffset;
    this.meta = new Int32Array(buffer, this.byteOffset, 1); // Should probably be removed
    this.stream = new Stream(buffer, this.meta.byteOffset + this.meta.byteLength, maxLength - this.meta.byteLength);
    this.header = new Header();
    this.headerAsView = new Uint8Array(this.header.buffer);
    this.head = this.stream.head;
    this.tail = this.stream.tail;
  }

  /**
   * Checks if the packet stream is empty.
   * 
   * @returns {boolean} True if the stream is empty, false otherwise
   */
  isEmpty() {
    return this.stream.isEmpty();
  }

  /**
   * Attempts to write a packet to the stream.
   * 
   * @param {Uint8Array} [data=defaultBuffer] - Data to write as a packet
   * @returns {boolean} True if the packet was written successfully, false otherwise
   */
  tryWrite(data = defaultBuffer) {
    const stream = this.stream;
    const header = this.header;
    header.bytes = data;
    const buffer = header.buffer;
    header.size = buffer.byteLength;
    const result = stream.tryWrite(buffer);
    return !!result;
  }

  /**
   * Attempts to read a packet from the stream.
   * 
   * @returns {Uint8Array|undefined} The packet data or undefined if no packet available
   */
  tryRead() {
    const stream = this.stream;
    const peek = stream.scan(4);
    if(!peek) {
      return;
    }
    const packet = this.allocator.construct(Uint32.getValue(peek));
    const result = stream.tryRead(packet);
    if(!result) {
      return;
    }

    return packet.subarray(kMinHeaderByteLength);
  }

  /**
   * Reads a packet from the stream with a timeout.
   * 
   * @param {Uint8Array} data - Buffer to read the packet into
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
   * Asynchronously reads a packet from the stream with a timeout.
   * 
   * @param {Uint8Array} data - Buffer to read the packet into
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