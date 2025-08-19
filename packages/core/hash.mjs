// Inspiration: https://github.com/immutable-js/immutable-js/blob/372d376278dcde481efe69c7ede0602423db2024/src/Hash.js
import LRUMap from './LRUMap.mjs';
import withCache from './withCache.mjs';

/**
 * Hashes an integer value with a seed
 * @param {number} value - Integer to hash
 * @param {number} seed - Seed value for hashing
 * @returns {number} 32-bit hash value
 */
function hashInt(value = 0, seed = 0) {
  let tmp = ((seed << 5) - seed + value) ^ ((value << 7) | (value >>> 25));
  tmp += tmp << 3; // Arbitrary bit shifts to mix bits further
  return (tmp & tmp) >>> 0;
}

/**
 * Hashes a number value
 * @param {number} v - Number to hash
 * @param {number} s - Seed value
 * @returns {number} 32-bit hash value
 */
const hashNumber = (v = 0, s = 0) => hashInt(v|0, s);

/**
 * Hashes a boolean value
 * @param {boolean} v - Boolean to hash
 * @param {number} s - Seed value
 * @returns {number} 32-bit hash value
 */
const hashBool = (v, s = 0) => hashInt(v ? 0x42108421 : 0x42108420, s);

/**
 * Gets a weak code for objects using WeakMap cache
 * @param {object} value - Object to get code for
 * @returns {number} Random 32-bit integer
 */
const getWeakCode = withCache(new WeakMap(), () => (Math.random() * (2**32 - 1))|0);

/**
 * Gets character codes for a string using LRU cache
 * @param {string} str - String to get codes for
 * @returns {number[]} Array of character codes
 */
const getCharCodes = withCache(new LRUMap(2**10), str => str.split('').map(s => s.charCodeAt(0)));

/**
 * Hashes a string value
 * @param {string} v - String to hash
 * @param {number} s - Seed value
 * @returns {number} 32-bit hash value
 */
const hashString = (v, s = 0) => getCharCodes(v).reduce((s, c) => hashInt(c, s), s);

const zero = BigInt(0);
const minusOne = BigInt(-1);
const maxuint32 = 2**32 -1;
const maxuint32AsBigint = BigInt(maxuint32);
const bit32Length = BigInt(maxuint32.toString().length);

/**
 * Hashes a BigInt value
 * @param {bigint} value - BigInt to hash
 * @param {number} seed - Seed value
 * @returns {number} 32-bit hash value
 */
function hashBigInt(value = 0n, seed = 0) {
  return  value < zero ? hashBigInt(value * minusOne, hashInt(1, seed)) :
          value <= maxuint32AsBigint ? hashInt(Number(value), seed) :
          hashBigInt(value >> bit32Length, hashInt(maxuint32, seed));
}

/**
 * Generates a hash for any JavaScript value
 * @param {*} value - Value to hash
 * @param {number} seed - Seed value for hashing
 * @returns {number} 32-bit hash value
 * @throws {Error} When encountering unsupported types
 */
export default function hash(value, seed = 0) {
  if(value === null) {
    return hashInt(0x42108422, seed);
  }
  if(value === void(0)) {
    return hashInt(0x42108423, seed);
  }

  const type = typeof value;
  switch(type) {
    case 'boolean':
      return hashBool(value, seed);
    case 'string':
      return hashString(value, seed);
    case 'number':
      return hashNumber(value, seed);
    case 'bigint':
      return hashBigInt(value, seed);
    case 'symbol':
    case 'function':
      return hashInt(getWeakCode(value), seed);
    case 'object':
      return  (typeof value.hashCode === 'function') ? hashInt(value.hashCode(), seed) :
              (typeof value.reduce === 'function') ? value.reduce((s, v) => hash(v, s), seed) :
              hash(Object.entries(value), seed);
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
};