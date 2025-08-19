/**
 * 8-bit unsigned integer type implementation.
 * Provides direct byte access for 8-bit unsigned integers.
 */
export default class Uint8 {

  /**
   * Number of bytes required to store an 8-bit unsigned integer.
   * @type {number}
   */
  static BYTES_PER_ELEMENT = 1;

  /**
   * Gets an 8-bit unsigned integer value from a buffer at the specified offset.
   * 
   * @param {Uint8Array} buffer - The buffer to read from
   * @param {number} [byteOffset=0] - Byte offset within the buffer
   * @returns {number} The 8-bit unsigned integer value
   */
  static getValue(buffer, byteOffset = 0) {
    return buffer[byteOffset];
  }

  /**
   * Sets an 8-bit unsigned integer value in a buffer at the specified offset.
   * 
   * @param {Uint8Array} buffer - The buffer to write to
   * @param {number} byteOffset - Byte offset within the buffer
   * @param {number} value - The 8-bit unsigned integer value to write
   */
  static setValue(buffer, byteOffset, value) {
    buffer[byteOffset] = value;
  }

};