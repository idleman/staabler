import compileOptions from './compileOptions.mjs';
import isNullish from '@staabler/core/isNullish.mjs';
import autobind from '@staabler/core/autobind.mjs';

export default class Memory {
  
  constructor() {
    autobind(this);
    this.closed = false;
    this.filename = ':memory:';
    this.buffer = new Uint8Array(0);
    this.rpos = 0;
    this.subscribers = [];
  }

  fdatasyncSync() {

  }
  
  truncate() {
    this.rpos = 0;
    this.buffer = new Uint8Array(0);
  }

  writeSync(data, opt) {
    if(this.closed) {
      throw new Error('Memory file is closed');
    }
    const options = compileOptions(data, opt);
    const chunk = data.subarray(options.offset, options.offset + options.length);
    const position = (options.position === null || options.position < 0) ? this.buffer.byteLength : options.position;
    const newLength = Math.max(this.buffer.byteLength, position + chunk.byteLength);
    if(this.buffer.byteLength < newLength) {
      const curr = this.buffer;
      this.buffer = new Uint8Array(newLength);
      this.buffer.set(curr);
    }
    this.buffer.set(chunk, position);
    setImmediate(() => this.subscribers.forEach(cb => cb()));
    return chunk.byteLength;
  }

  writevSync(buffers, pos) {
    if(this.closed) {
      throw new Error('Memory file is closed');
    }
    let totalBytes = 0;
    let position = isNullish(pos) ? this.buffer.byteLength : pos;

    for (const chunk of buffers) {
      const bytesWritten = this.writeSync(chunk, { position });
      position += bytesWritten;
      totalBytes += bytesWritten;
    }
    

    return totalBytes;
  }

  readSync(data, opt) {
    if(this.closed) {
      throw new Error('Memory file is closed');
    }
    const options = compileOptions(data, opt);
    const useRpos = !!(options.position === null || options.position < 0);
    const position = useRpos ? this.rpos : options.position;
    const chunk = this.buffer.subarray(position, position + Math.min(this.buffer.byteLength - position, options.length));
    data.set(chunk, options.offset);
    if(useRpos) {
      this.rpos += chunk.byteLength;
    }
    return chunk.byteLength;
  }

  readvSync(buffers, pos = -1) {
    if(this.closed) {
      throw new Error('Memory file is closed');
    }
    let totalBytes = 0;
    const useRpos = !!(pos === null || pos < 0);
    let position = useRpos ? this.rpos : pos;
    for (const chunk of buffers) {
      const bytesWritten = this.readSync(chunk, { position });
      position += bytesWritten;
      totalBytes += bytesWritten;
    }
    if(useRpos) {
      this.rpos += totalBytes;
    }
    return totalBytes;
  }


  statSync() {
    if(this.closed) {
      throw new Error('Memory file is closed');
    }
    return {
      size: this.buffer.byteLength,
      isFile: () => true,
      isDirectory: () => false
    };
  }

  closeSync() {
    if(this.closed) {
      throw new Error('Memory file is closed');
    }
    this.closed = true;
    this.buffer = null;
  }

  write(buffer, options) {
    return Promise.resolve(this.writeSync(buffer, options));
  }

  writev(buffers, position) {
    return Promise.resolve(this.writevSync(buffers, position));
  }

  read(buffer, options) {
    return Promise.resolve(this.readSync(buffer, options));
  }

  readv(buffers, position) {
    return Promise.resolve(this.readvSync(buffers, position));
  }

  stat() {
    return Promise.resolve(this.statSync());
  }

  close() {
    this.closeSync();
    return Promise.resolve();
  }


  watch(cb) {
    const subscribers = this.subscribers;
    subscribers.push(cb);
    return () => {
      const index = subscribers.indexOf(cb);
      if(index !== -1) {
        subscribers.splice(index, 1);
      }
    }
  }

  [Symbol.dispose]() {
    return this.closeSync();
  }
  
  toString(encoding = 'utf-8') {
    return this.buffer.toString(encoding);
  }

};