/**
 * Memory allocator for efficient buffer management.
 * 
 * Used to construct underlying memory buffers for TypedArray(s). The allocator
 * will whenever possible try to re-use previous instances and their memory
 * to minimize garbage collection pressure.
 * 
 * For performance reasons, a fixed size array is used for object pooling.
 * 
 * @example
 * const allocator = new Allocator();
 * const buffer = allocator.allocate(200); // Returns 256-byte buffer
 * const array = allocator.construct(100, Uint8Array);
 * allocator.deallocate(buffer);
 * allocator.destruct(array);
 */
let defaultInstance = null;
const nullInitialzer = () => null;

export default class Allocator {

  /**
   * Gets the singleton instance of the allocator.
   * 
   * @returns {Allocator} The default allocator instance
   * 
   * @example
   * const allocator = Allocator.getInstance();
   */
  static getInstance() {
    if(!defaultInstance) {
      defaultInstance = new Allocator();
    }
    return defaultInstance;
  }

  /**
   * Creates a new allocator instance.
   * 
   * @param {Function} [Type=ArrayBuffer] - The buffer constructor to use (ArrayBuffer or SharedArrayBuffer)
   * @param {number} [length=8] - The initial length of the object pool
   * 
   * @example
   * const allocator = new Allocator(SharedArrayBuffer, 16);
   */
  constructor(Type = ArrayBuffer, length = 8) {
    this.Type = Type;
    this.length = length;
    this.objects = Array.from({ length: length*2 }, nullInitialzer);
    this.buffers = Array
      .from({ length: 17 })
      .map((_, index) => [2**(index + 4), this.objects.slice(0)]);
  }

  /**
   * Allocates a memory buffer of appropriate size.
   * 
   * Attempts to find a suitable buffer from the pool first. If none is available,
   * creates a new buffer of the requested size or the next available power-of-2 size.
   * 
   * @param {number} [atleastByteLength=0] - The minimum byte length required
   * @returns {ArrayBuffer|SharedArrayBuffer} The allocated buffer
   * 
   * @example
   * const buffer = allocator.allocate(200); // Returns 256-byte buffer
   */
  allocate(atleastByteLength = 0) {
    const Type = this.Type;
    for(const [byteLength, items] of this.buffers) {
      if(atleastByteLength <= byteLength) {
        for(let i = 0, len = items.length; i < len; ++i) {
          const maybe = items[i];
          if(maybe) {
            items[i] = null;
            return maybe;
          }
        }
        return new Type(byteLength);
      }
    }
    return new Type(atleastByteLength);
  }

  /**
   * Deallocates a previously allocated buffer back to the pool.
   * 
   * Returns the buffer to the appropriate pool for potential reuse.
   * If the pool is full, the buffer is discarded to prevent memory leaks.
   * 
   * @param {ArrayBuffer|SharedArrayBuffer} buffer - The buffer to deallocate
   * 
   * @example
   * allocator.deallocate(buffer);
   */
  deallocate(buffer) {
    const byteLength = buffer.byteLength;
    for(const [maxByteLength, items] of this.buffers) {
      if(byteLength <= maxByteLength) {
        for(let i = 0, len = items.length; i < len; ++i) {
          if(items[i] === null) {
            items[i] = buffer;
          }
        }
        // Garbage if already full.
        return;
      }
    }
  }

  /**
   * Constructs a TypedArray using a memory buffer from allocate().
   * 
   * Efficiently creates a TypedArray by reusing existing objects from the pool
   * or allocating a new buffer if needed. Equivalent to: new TypedArray(buffer, 0, length)
   * 
   * @param {number} [length=0] - The length of the array to construct
   * @param {Function} [Type=Uint8Array] - The TypedArray constructor to use
   * @returns {TypedArray} The constructed TypedArray
   * 
   * @example
   * const array = allocator.construct(100, Uint32Array);
   */
  construct(length = 0, Type = Uint8Array) {
    const objects = this.objects;
    for(let i = 0, len = objects.length; i < len; ++i) {
      const obj = objects[i];
      if(obj?.constructor === Type && obj.length === length) {
        objects[i] = null;
        return obj;
      }
    }
    const buffer = this.allocate(Type.BYTES_PER_ELEMENT*length);
    return new Type(buffer, 0, length);
  }

  /**
   * Destructs a TypedArray object back to the pool.
   * 
   * Returns the TypedArray to the object pool for potential reuse.
   * This should be called when the TypedArray is no longer needed.
   * 
   * @param {TypedArray} typedArray - The TypedArray to destruct
   * 
   * @example
   * allocator.destruct(array);
   */
  destruct(typedArray) {
    const objects = this.objects;
    for(let i = 0, len = objects.length; i < len; ++i) {
      if(objects[i] === null) {
        objects[i] = typedArray;
        return;
      }
    }
  }
  
};