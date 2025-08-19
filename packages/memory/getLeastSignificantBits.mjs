/**
 * Extracts the K least significant bits from a number, starting at the specified offset.
 * 
 * @param {number} num - The number to extract bits from
 * @param {number} K - Number of bits to extract
 * @param {number} [offset=0] - Starting bit position (0-based)
 * @returns {number} The extracted bits as a number
 */
export default function getLeastSignificantBits(num, K, offset = 0) {
  // Create a mask with K least significant bits set to 1
  const mask = ((1 << K) - 1) << offset;
  
  // Use bitwise AND to isolate the K least significant bits
  return (num & mask) >> offset;
};