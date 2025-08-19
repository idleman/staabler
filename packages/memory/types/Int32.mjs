/**
 * 32-bit signed integer type implementation with optimized byte-level access.
 * 
 * This class provides static methods for reading and writing 32-bit signed integers
 * to ArrayBuffer views, handling proper sign extension and little-endian byte order.
 */
export default class Int32 {
  /** Number of bytes required to store a 32-bit integer */
  static BYTES_PER_ELEMENT = 4;

  /**
   * Reads a 32-bit signed integer from a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to read from
   * @param {number} [byteOffset=0] - The byte offset to read from
   * @returns {number} The 32-bit signed integer value
   */
  static getValue(buffer, byteOffset = 0) {
    return (buffer[byteOffset] |
      (buffer[byteOffset + 1] << 8) |
      (buffer[byteOffset + 2] << 16) |
      (buffer[byteOffset + 3] << 24)) >> 0; // Ensure signed 32-bit integer
  }

  /**
   * Writes a 32-bit signed integer to a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to write to
   * @param {number} [byteOffset=0] - The byte offset to write to
   * @param {number} value - The 32-bit signed integer value to write
   */
  static setValue(buffer, byteOffset, value) {
    buffer[byteOffset] = value & 0xff;
    buffer[byteOffset + 1] = (value >> 8) & 0xff;
    buffer[byteOffset + 2] = (value >> 16) & 0xff;
    buffer[byteOffset + 3] = (value >> 24) & 0xff;
  }
}