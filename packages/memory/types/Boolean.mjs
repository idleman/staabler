import Uint8 from './Uint8.mjs';

/**
 * Boolean type implementation.
 * Stores boolean values as 8-bit integers (0 or 1) for memory efficiency.
 */
export default class Boolean {

  /**
   * Number of bytes required to store a boolean value.
   * @type {number}
   */
  static BYTES_PER_ELEMENT = 1;

  /**
   * Gets a boolean value from a buffer at the specified offset.
   * 
   * @param {Uint8Array} buffer - The buffer to read from
   * @param {number} [byteOffset=0] - Byte offset within the buffer
   * @returns {boolean} The boolean value (true for non-zero, false for zero)
   */
  static getValue(...args) {
    return !!Uint8.getValue(...args);
  }

  /**
   * Sets a boolean value in a buffer at the specified offset.
   * 
   * @param {Uint8Array} buffer - The buffer to write to
   * @param {number} byteOffset - Byte offset within the buffer
   * @param {boolean} value - The boolean value to write (stored as 1 for true, 0 for false)
   */
  static setValue(buffer, byteOffset, value) {
    return Uint8.setValue(buffer, byteOffset, value ? 1 : 0);
  }
  
};