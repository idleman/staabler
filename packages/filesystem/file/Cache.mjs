import autobind from '@staabler/core/autobind.mjs';
import compileOptions from './compileOptions.mjs';
import Allocator from '@staabler/core/Allocator.mjs';

const emptyView = new Uint8Array(0);


export default class Cache {

  constructor(handle, byteLength = 2**18, allocator = Allocator.getInstance()) {
    autobind(this);
    
    this.handle = handle;
    this.allocator = allocator;
    this.end = 0;
    this.begin = 0;
    this.cacheHits = 0;
    this.byteLength = byteLength;
    this.buffer = allocator.construct(byteLength);
    // Will not work: Object.assign(this, handle); - unsure why though
    this.filename = handle.filename;
    this.stat = handle.stat;
    this.readv = handle.readv;
    this.write = handle.write;
    this.writev = handle.writev;
    this.watch = handle.watch;
    this.close = handle.close;
    this.toString = handle.toString;
    this.statSync = handle.statSync;
    this.closeSync = handle.closeSync;
    this.readvSync = handle.readvSync;
    this.writeSync = handle.writeSync;
    this.writevSync = handle.writevSync;
    this.fdatasyncSync = handle.fdatasyncSync;
  }

  readFromCache(buffer, opt) {
    const end = this.end;
    const begin = this.begin;
    const options = compileOptions(buffer, opt);
    const { offset, length, position } = options; // The location where to begin reading data from the file. If null or -1, data will be read from the current file position.
    if(position === null || position < 0 || position < begin || end <= position) {
      return options;
    }
    const byteOffset = position - begin;
    const bytesRead = Math.min(Math.min(end - begin, length), this.buffer.byteLength - byteOffset);
    if(bytesRead <= 0) {
      return options;
    }

    const start = position - begin;
    buffer.set(this.buffer.subarray(start, start + bytesRead), offset);
    ++this.cacheHits;
    return {
      bytesRead,
      offset: offset + bytesRead,
      length: length - bytesRead,
      position: position + bytesRead,
    };
  }

  updateCache(position = -1) {
    if(position === null || position < 0 || (this.begin <= position && position < this.end)) {
      return 0;
    }
    
    this.cacheHits = 0;
    const bytesRead = this.handle.readSync(this.buffer, { position });
    this.begin = position;
    this.end = position + bytesRead;
    return bytesRead;
  }

  readSync(buffer, opt) {
    this.updateCache(opt?.position);
    const { bytesRead, ...options} = this.readFromCache(buffer, opt);
    return bytesRead + (options.length ? this.handle.readSync(buffer, options) : 0);
  }

  async read(buffer, opt) {
    this.updateCache(opt?.position);
    const { bytesRead = 0, ...options } = this.readFromCache(buffer, opt);
    return bytesRead + (options.length ? (await this.handle.read(buffer, options)) : 0);
  }

  /**
   * Try to read at least N bytes into the cache and returns a slice of the returned data.
   * @param {number} length 
   * @param {number} position 
   */
  peek(length = 0, position = -1) {
    if(position === null || position < 0) {
      return emptyView;
    }
    const allocator = this.allocator;
    const idealByteLength = this.byteLength;
    const byteLength = Math.max(idealByteLength, length);
    const currBufferByteLength = this.buffer.byteLength;
    if(currBufferByteLength < byteLength || idealByteLength < currBufferByteLength) {
      allocator.destruct(this.buffer);
      this.buffer = allocator.construct(byteLength);
    }
    
    const buffer = this.buffer;
    const end = position + length;
    if(this.begin <= position && end <= this.end) {
      const offset = position - this.begin;
      return buffer.subarray(offset, offset + length);
    }
    
    const bytesRead = this.handle.readSync(buffer, { position });
    this.begin = position;
    this.end = position + bytesRead;
    return bytesRead === length ? buffer : buffer.subarray(0, Math.min(length, bytesRead));
  }

};