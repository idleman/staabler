import getDataView from '../getDataView.mjs';

/**
 * 32-bit floating-point type implementation with optimized byte-level access.
 * 
 * This class provides static methods for reading and writing 32-bit floating-point
 * numbers to ArrayBuffer views using little-endian byte order.
 */
export default class Float32 {

  /** Number of bytes required to store a 32-bit float */
  static BYTES_PER_ELEMENT = 4;

  /**
   * Reads a 32-bit floating-point number from a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to read from
   * @param {number} [byteOffset=0] - The byte offset to read from
   * @returns {number} The 32-bit floating-point value
   */
  static getValue(buffer, byteOffset = 0) {
    return getDataView(buffer).getFloat32(byteOffset, true);
  }

  /**
   * Writes a 32-bit floating-point number to a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to write to
   * @param {number} [byteOffset=0] - The byte offset to write to
   * @param {number} value - The 32-bit floating-point value to write
   */
  static setValue(buffer, byteOffset, value) {
    const view = getDataView(buffer);
    view.setFloat32(byteOffset, value, true);
  }

};