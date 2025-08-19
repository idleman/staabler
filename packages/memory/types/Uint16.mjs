/**
 * 16-bit unsigned integer type implementation with optimized byte-level access.
 * 
 * This class provides static methods for reading and writing 16-bit unsigned integers
 * to ArrayBuffer views using little-endian byte order.
 */
export default class Uint16 {
  
  /** Number of bytes required to store a 16-bit integer */
  static BYTES_PER_ELEMENT = 2;

  /**
   * Reads a 16-bit unsigned integer from a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to read from
   * @param {number} [byteOffset=0] - The byte offset to read from
   * @returns {number} The 16-bit unsigned integer value
   */
  static getValue(buffer, byteOffset = 0) {
    return buffer[byteOffset] | (buffer[byteOffset + 1] << 8);
  }

  /**
   * Writes a 16-bit unsigned integer to a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to write to
   * @param {number} [byteOffset=0] - The byte offset to write to
   * @param {number} value - The 16-bit unsigned integer value to write
   */
  static setValue(buffer, byteOffset, value) {
    buffer[byteOffset] = value & 0xFF;
    buffer[byteOffset + 1] = (value >> 8) & 0xFF;
  }
}
