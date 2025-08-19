/**
 * Sets a bit at a specific position in a number.
 * 
 * @param {number} val - The number to modify
 * @param {number} pos - The bit position (0-based, right to left)
 * @param {number} [n=1] - The bit value to set (0 or 1)
 * @returns {number} The modified number
 */
export default function setBit(val, pos, n = 1) {
  const bit = n ? 1 : 0;
  const mask = ~(1 << pos);
  return (val & mask) | (bit << pos);
};