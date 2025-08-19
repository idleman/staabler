import hash from './hash.mjs';
import isEqual from './isEqual.mjs';
import isWeakable from './isWeakable.mjs';
import DefaultMap from './DefaultMap.mjs';

const pool = new DefaultMap(() => new Set());

/**
 * Implements the flyweight pattern to reuse identical objects.
 * Returns an existing object from the pool if an equal one exists,
 * otherwise adds the new object to the pool and returns it.
 * 
 * @param {Object} object - The object to deduplicate
 * @returns {Object} Either the existing equal object or the input object
 * @throws {Error} If the object is not weakable
 */
export default function flyweight(object) {
  if(!isWeakable(object)) {
    throw new Error(`Object ${object} is not weakable`);
  }

  const deleted = [];
  const bucketId = hash(object);
  const bucket = pool.get(bucketId);
  for(const handle of bucket) {
    const value = handle.deref();
    if(!value) {
      deleted.push(handle);
      continue;
    }
    
    if(!isEqual(value, object)) {
      continue;
    }
    
    deleted.forEach(h => bucket.delete(h));
    return value;
  }

  bucket.add(new WeakRef(object));
  return object;
};