/**
 * 32-bit unsigned integer type implementation.
 * Provides optimized byte-level access for 32-bit unsigned integers.
 * Uses bitwise operations for cross-platform compatibility.
 */
export default class Uint32 {

  /**
   * Number of bytes required to store a 32-bit unsigned integer.
   * @type {number}
   */
  static BYTES_PER_ELEMENT = 4;

  /**
   * Gets a 32-bit unsigned integer value from a buffer at the specified offset.
   * Uses optimized bitwise operations for cross-platform compatibility.
   * 
   * @param {Uint8Array} buffer - The buffer to read from
   * @param {number} [byteOffset=0] - Byte offset within the buffer
   * @returns {number} The 32-bit unsigned integer value
   */
  static getValue(buffer, byteOffset = 0) {
    return (
      buffer[byteOffset] |
      (buffer[byteOffset + 1] << 8) |
      (buffer[byteOffset + 2] << 16) |
      (buffer[byteOffset + 3] << 24)
    ) >>> 0; // Ensure unsigned 32-bit
  }

  /**
   * Sets a 32-bit unsigned integer value in a buffer at the specified offset.
   * Uses optimized bitwise operations for cross-platform compatibility.
   * 
   * @param {Uint8Array} buffer - The buffer to write to
   * @param {number} byteOffset - Byte offset within the buffer
   * @param {number} value - The 32-bit unsigned integer value to write
   */
  static setValue(buffer, byteOffset, value) {
    buffer[byteOffset] = value & 0xFF;        // Least significant byte
    buffer[byteOffset + 1] = (value >> 8) & 0xFF;
    buffer[byteOffset + 2] = (value >> 16) & 0xFF;
    buffer[byteOffset + 3] = (value >> 24) & 0xFF;  // Most significant byte
  }
  
};