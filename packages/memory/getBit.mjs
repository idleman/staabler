/**
 * Gets the bit value at a specific position in a number.
 * 
 * @param {number} val - The number to extract the bit from
 * @param {number} pos - The bit position (0-based, right to left)
 * @returns {number} The bit value (0 or 1)
 */
export default function getBit(val, pos) {
  return (val & (1 << pos)) === 0 ? 0 : 1;
};