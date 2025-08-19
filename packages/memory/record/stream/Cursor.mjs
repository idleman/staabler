
import Header from './Header.mjs';
import Record from '../../Record.mjs';
import Utf8 from '../../types/Utf8.mjs';
import Uint32 from '../../types/Uint32.mjs';
import BigUint64 from '../../types/BigUint64.mjs';
import addEventListener from '@staabler/core/addEventListener.mjs';
// We want to be able to ignore some events.
const getUint32Value = Uint32.getValue;
const getBigUint64Value = BigUint64.getValue;

/**
 * A cursor for iterating over record data in a stream with filtering and mapping capabilities.
 * 
 * The Cursor provides a way to traverse through records in a stream, applying filters
 * and transformations to the data as it's being read. It supports both synchronous
 * and asynchronous iteration patterns.
 */
export default class Cursor {

  /**
   * Creates a new Cursor instance.
   * 
   * @param {Object} stream - The stream to iterate over
   * @param {number} [position=0] - The starting position in the stream
   * @param {AbortSignal} [signal=null] - Optional abort signal for cancellation
   */
  constructor(stream, position = 0, signal = null) {
    this._Cursor = {
      stream,
      signal,
      position,
      filters: [],
      mappers: [],
    };
  }

  /**
   * Adds a filter function to the cursor chain.
   * 
   * @param {Function} cb - Filter function that receives (Type, initial, end) and returns boolean
   * @returns {Cursor} Returns this cursor for chaining
   */
  filter(cb) {
    this._Cursor.filters.push(cb);
    return this;
  }

  /**
   * Adds a mapper function to the cursor chain.
   * 
   * @param {Function} cb - Mapper function that receives an instance and returns a transformed instance
   * @returns {Cursor} Returns this cursor for chaining
   */
  map(cb) {
    this._Cursor.mappers.push(cb);
    return this;
  }

  /**
   * Creates an iterator that yields records from the stream.
   * 
   * The iterator handles flow control automatically and provides cleanup.
   * It can yield either record data or promises for async operations.
   * 
   * @generator
   * @yields {Promise|Array} Either a promise for async operations or [initial, mapped, position] for records
   */
  *iterator() {
    //  Its possible to create some other kind of the iterator, but this
    //  way to it handle the flow control automatically as well as
    //  cleanup - with the help of finally.
    let resolver = null;
    let watching = false;
    const unsubscribers = [];
    const dataMap = this._Cursor;
    
    let { signal, position } = dataMap;
    const { stream, filters, mappers } = dataMap;

    if(signal) {
      unsubscribers.push(addEventListener(signal, 'abort', () => resolver?.resolve()));
    } else {
      signal = { aborted: false };
    }
    
    const native = stream.native;
    const registry = stream.registry;
    const headerByteLength = Header.BYTES_PER_ELEMENT;
    
    /**
     * Reads a specified number of bytes from the stream.
     * 
     * @param {number} byteLength - Number of bytes to read
     * @returns {Array} [buffer, promise] - Either the buffer or a promise if not enough data
     */
    function read(byteLength) {
      const buffer = native.peek(byteLength, position);
      if(buffer.byteLength !== byteLength) {
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
        return [null, promise];
      }
      position += byteLength;
      return [buffer, null];
    }
    
    try {
      while(!signal.aborted) {
        
        const initial = position;
        const [header, headerPromise] = read(headerByteLength, position);
        if(headerPromise) {
          yield headerPromise;
          continue;
        }
        
        const type = getBigUint64Value(header, 0);
        const bodyByteLength = getUint32Value(header, 8);
        const schemaByteLength = getUint32Value(header, 12);
        
        let Type = registry.get(type);
        
        if(schemaByteLength) {
          if(Type) {
            position += schemaByteLength;
          } else {
            while(true) {
              const [buffer, bufferPromise] = read(schemaByteLength);
              if(bufferPromise) {
                yield bufferPromise;
                continue;
              }
              const bufferAsString = Utf8.getValue(buffer, 0, schemaByteLength);
              const [name, schema] = JSON.parse(bufferAsString);
              Type = Record(name,schema);
              registry.set(type, Type);
              break;
            }
          }

        }

        if(!Type) {
          throw new Error(`Unknown type (type=${type}, position=${position})`);
        }
        
        const filtered = filters.every(cb => cb(Type, initial, position + bodyByteLength));
        if(!filtered) {
          position += bodyByteLength;
          continue;
        }

        let body = null;
        
        while(true) {
          const [buffer, bufferPromise] = read(bodyByteLength);
          if(bufferPromise) {
            yield bufferPromise;
            continue;
          }
          body = buffer;
          break;
        }

        const instance = new Type(body);
        const mapped = mappers.reduce((instance, cb) => cb(instance), instance);
        yield [initial, mapped, position];
      }
    } finally {
      unsubscribers.forEach(cb => cb());
    }
  }

  /**
   * Returns an iterator for this cursor.
   * 
   * @returns {Iterator} An iterator that yields records from the stream
   */
  [Symbol.iterator]() {
    return this.iterator();
  }
}