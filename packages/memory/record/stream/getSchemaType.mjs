import crypto from 'node:crypto';
import withCache from '@staabler/core/withCache.mjs';

/**
 * Converts a byte array to a BigUint64 value.
 * 
 * @param {Uint8Array} bytes - The byte array to convert
 * @returns {bigint} The 64-bit unsigned integer value
 */
function toBigUint(bytes) {
  let result = 0n;
  for (let i = 0; i < bytes.length; i++) {
      result = (result << 8n) | BigInt(bytes[i]);
  }
  // Ensure 64-bit unsigned by masking with 2^64 - 1
  return result & 0xFFFFFFFFFFFFFFFFn;
}

/**
 * Generates a unique schema type identifier from a schema definition.
 * Uses SHA-256 hash of the JSON stringified schema, truncated to 64 bits.
 * Cached for performance to avoid repeated hash calculations.
 * 
 * @param {Object} schema - The schema definition
 * @returns {bigint} A 64-bit unsigned integer representing the schema type
 */
export default withCache(new WeakMap(), schema => {
  const json = JSON.stringify(schema);
  return toBigUint(crypto.createHash('sha256').update(json).digest().subarray(0, 8));
});