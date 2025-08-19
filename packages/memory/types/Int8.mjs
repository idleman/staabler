/**
 * 8-bit signed integer type implementation with optimized byte-level access.
 * 
 * This class provides static methods for reading and writing 8-bit signed integers
 * to ArrayBuffer views, handling proper sign extension.
 */
export default class Int8 {
  /** Number of bytes required to store an 8-bit integer */
  static BYTES_PER_ELEMENT = 1;

  /**
   * Reads an 8-bit signed integer from a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to read from
   * @param {number} [byteOffset=0] - The byte offset to read from
   * @returns {number} The 8-bit signed integer value
   */
  static getValue(buffer, byteOffset = 0) {
    return (buffer[byteOffset] << 24) >> 24; // Sign-extend from 8-bit
  }

  /**
   * Writes an 8-bit signed integer to a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to write to
   * @param {number} [byteOffset=0] - The byte offset to write to
   * @param {number} value - The 8-bit signed integer value to write
   */
  static setValue(buffer, byteOffset, value) {
    buffer[byteOffset] = value & 0xFF;
  }
  
};