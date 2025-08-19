/**
 * A low level stream. It only manage writing/reading memory/Record(s)
 * to a single file. Design guidelines:
 * 
 *  - Synchronous write. This is for performance reasons. It
 *    minimize the amount of copying and promise creation.
 * 
 *  - Parallelization should primary be done by a thread pool.
 */
import Utf8 from '../types/Utf8.mjs';
import Header from './stream/Header.mjs';
import Cursor from './stream/Cursor.mjs';
import BiMap from '@staabler/core/BiMap.mjs';
import autobind from '@staabler/core/autobind.mjs';
import Allocator from '@staabler/core/Allocator.mjs';
import isThenable from '@staabler/core/isThenable.mjs';
import ObjectPool from '@staabler/core/ObjectPool.mjs';
import getSchemaType from './stream/getSchemaType.mjs';
import withCallOnce from '@staabler/core/withCallOnce.mjs';
import StreamWriteError from './stream/StreamWriteError.mjs';
import noop from '@staabler/core/noop.mjs';

const defaultProjection = {
  handle: noop,
  match: () => false,
};

/**
 * A low-level stream for managing memory/Record writing and reading to a single file.
 * 
 * This stream provides synchronous write operations for performance reasons,
 * minimizing copying and promise creation. It supports record-based data
 * with automatic schema management and projection capabilities.
 */
export default class Stream {
  
  /**
   * Creates a new Stream instance.
   * 
   * @param {Object} native - The native stream implementation
   * @param {Object} [projection=defaultProjection] - Projection configuration for filtering and handling records
   * @param {Allocator} [allocator=Allocator.getInstance()] - Memory allocator instance
   */
  constructor(native, projection = defaultProjection, allocator = Allocator.getInstance()) {
    autobind(this);
    this.native = native;
    this.position = 0;
    this.registry = new BiMap(); // [type, schema]
    this.projection = projection;
    this.allocator = allocator;
    this.pool = new ObjectPool(() => new Header());
    this.init = withCallOnce(this.init);
    this.init();
  }

  /**
   * Initializes the stream by processing existing records according to the projection.
   * This method is called once during construction.
   */
  init() {
    // We cannot use a filter here because we need to know the next position
    const projection = this.projection;
    const cursor = this.createCursor()
      .filter((Type, position, next) => {
        if(this.position < next) {
          this.position = next;
        }
        return projection.match(Type, position, next);
      });

    for(const maybe of cursor) {
      if(isThenable(maybe)) {
        break;
      }
      const [position, record, nextPosition] = maybe;
      projection.handle(record, position, nextPosition);
    }
  }

  /**
   * Writes a single record synchronously to the stream.
   * 
   * @param {Object} record - The record to write
   * @returns {Stream} Returns this stream for chaining
   */
  writeOneSync(record) {
    return this.writeManySync([record]);
  }

  /**
   * Writes multiple records synchronously to the stream.
   * 
   * @param {Array|Iterable} [itertorable=[]] - Records to write
   * @returns {Stream} Returns this stream for chaining
   */
  writeManySync(itertorable = []) {
    const records = Array.isArray(itertorable) ? itertorable : Array.from(itertorable);
    if(records.length === 0) {
      return this;
    }


    const buffers = [];
    const matches = [];
    const cleanup = [];
    let expectWriteResult = 0;
    const pool = this.pool;
    let position = this.position;
    const registry = this.registry;
    const allocator = this.allocator;
    const projection = this.projection;
    const headers = Array.from({ length: records.length }, () => pool.construct());
    // We cannot know it because we dont know each packet full size (it may hve a schema)
    for(let i = 0, len = records.length; i < len; ++i) {
      const record = records[i];
      const header = headers[i];
      const Type = record.constructor;
      const schema = Type.schema;
      const type = getSchemaType(schema);
      const recordBuffer = record.buffer;
      const recordByteLength = recordBuffer.byteLength;
      const headerBuffer = header.buffer;
      const headerByteLength = headerBuffer.byteLength;
      const isKnownSchema = registry.has(type);
      const schemaAsJson = isKnownSchema ? '' : JSON.stringify(schema);
      const schemaLength = schemaAsJson ? Utf8.getByteLengthOf(schemaAsJson) : 0;
      const packetLength = headerByteLength + recordByteLength + (isKnownSchema ? 0 : schemaLength);
      //position += kHeaderByteLength;
      //const position = this.position + expectWriteResult; // it is previous position
      header.type = type;
      header.body = recordByteLength;
      header.schema = isKnownSchema ? 0 : schemaLength;
      
      const nextPosition = position + packetLength;
      buffers.push(headerBuffer);
      matches.push([Type, record, position, nextPosition]);
      position = nextPosition;
      expectWriteResult += packetLength;

      if(!isKnownSchema) {
        const schemaBuffer = allocator.construct(schemaLength, Uint8Array);
        Utf8.setValue(schemaBuffer, 0, schemaAsJson);
        buffers.push(schemaBuffer);
        cleanup.push(schemaBuffer);
        registry.set(type, Type);
      }
      
      buffers.push(recordBuffer);
    }
    
    try {
      const writeResult = this.native.writevSync(buffers);
      if(writeResult !== expectWriteResult) {
        throw new StreamWriteError(writeResult, expectWriteResult);
      }
      this.position += expectWriteResult;
      matches.forEach(([Type, record, position, nextPosition]) => {
        if(projection.match(Type, position, nextPosition)) {
          projection.handle(record, position, nextPosition);
        }
      });
    } finally {
      headers.forEach(obj => pool.destruct(obj));
      cleanup.forEach(obj => allocator.destruct(obj));
    }
    return this;
  }

  /**
   * Creates a cursor for iterating over records in the stream.
   * 
   * @param {number} [position=0] - Starting position for the cursor
   * @param {AbortSignal} [signal=null] - Optional abort signal for cancellation
   * @returns {Cursor} A cursor instance for iterating over records
   */
  createCursor(position = 0, signal = null) {
    return new Cursor(this, position, signal);
  }

  /**
   * Creates a binary subscriber that yields raw binary data from the stream.
   * 
   * @generator
   * @param {AbortSignal} [signal=null] - Optional abort signal for cancellation
   * @param {number} [position=0] - Starting position in the stream
   * @param {number} [byteLength=2**16] - Maximum bytes to read per chunk
   * @yields {Uint8Array|Promise} Either binary data or a promise for async operations
   */
  *createBinarySubscriber(signal = null, position = 0, byteLength = 2**16) {
    //  Its possible to create some other kind of the iterator, but this
    //  way to it handle the flow control automatically as well as
    //  cleanup - with the help of finally.
    let resolver = null;
    let watching = false;
    const unsubscribers = [];
    const native = this.native;
    if(signal) {
      unsubscribers.push(addEventListener(signal, 'abort', () => resolver?.resolve()));
    } else {
      signal = { aborted: false };
    }
    
    try {
      while(!signal.aborted) {
        const buffer = native.peek(byteLength, position);
        const bufferByteLength = buffer.byteLength;
        if(bufferByteLength) {
          position += bufferByteLength;
          yield buffer;
          continue;
        }

        resolver = Promise.withResolvers();
        const { promise } = resolver;
        if(!watching) {
          unsubscribers.push(native.watch(() => {
            if(resolver) {
              resolver.resolve();
              resolver = null;
            }
          }));
          watching = true;
        }
        yield promise;
      }
    } finally {
      unsubscribers.forEach(cb => cb());
    }
  }

  /**
   * Copies all data from this stream to another stream.
   * 
   * @param {Object} stream - The target stream to copy to
   * @returns {number} The number of bytes transferred
   */
  copyTo(stream) {
    let bytesTransferred = 0;
    const native = stream.native || stream;
    for(const chunk of this.createBinarySubscriber()) {
      if(isThenable(chunk)) {
        break;
      }
      bytesTransferred += chunk.byteLength;
      native.writeSync(chunk);
    }
    return bytesTransferred;
  }

  /**
   * Returns an iterator for iterating over records in the stream.
   * 
   * @returns {Iterator} An iterator that yields records from the stream
   */
  [Symbol.iterator]() {
    return this.createCursor()[Symbol.iterator]();
  }

};