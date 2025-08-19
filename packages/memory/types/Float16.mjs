import getDataView from '../getDataView.mjs';

/**
 * 16-bit floating-point type implementation with optimized byte-level access.
 * 
 * This class provides static methods for reading and writing 16-bit floating-point
 * numbers to ArrayBuffer views using IEEE 754 half-precision format.
 * The format uses 1 sign bit, 5 exponent bits, and 10 mantissa bits.
 */
export default class Float16 {
  
  /** Number of bytes required to store a 16-bit float */
  static BYTES_PER_ELEMENT = 2;

  /**
   * Reads a 16-bit floating-point number from a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to read from
   * @param {number} [byteOffset=0] - The byte offset to read from
   * @returns {number} The 16-bit floating-point value decoded to Float32
   */
  static getValue(buffer, byteOffset = 0) {
    const uint16 = getDataView(buffer).getUint16(byteOffset, true);
    return Float16.decode(uint16);
  }

  /**
   * Writes a 16-bit floating-point number to a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to write to
   * @param {number} [byteOffset=0] - The byte offset to write to
   * @param {number} value - The floating-point value to encode and write
   */
  static setValue(buffer, byteOffset, value) {
    const view = getDataView(buffer);
    view.setUint16(byteOffset, Float16.encode(value), true);
  }

  /**
   * Encodes a Float32 value into Float16 format (IEEE 754 half-precision).
   * 
   * @param {number} value - The Float32 value to encode
   * @returns {number} The encoded 16-bit value
   */
  static encode(value) {
    if (value === 0) return 0;

    const floatView = new Float32Array([value]);
    const intView = new Uint32Array(floatView.buffer);
    const sign = (intView[0] >> 31) & 0x1;
    let exponent = ((intView[0] >> 23) & 0xFF) - 127 + 15; // Adjust exponent bias
    let mantissa = (intView[0] >> 13) & 0x3FF; // Take 10 most significant bits

    if (exponent <= 0) return sign << 15; // Underflow, return zero
    if (exponent >= 31) return (sign << 15) | 0x7C00; // Overflow, return Inf

    return (sign << 15) | (exponent << 10) | mantissa;
  }

  /**
   * Decodes a Float16 value (IEEE 754 half-precision) into Float32.
   * 
   * @param {number} uint16 - The 16-bit encoded value
   * @returns {number} The decoded Float32 value
   */
  static decode(uint16) {
    const sign = (uint16 & 0x8000) ? -1 : 1;
    let exponent = (uint16 >> 10) & 0x1F;
    let mantissa = uint16 & 0x3FF;

    if (exponent === 0) return 0; // Zero or denormalized numbers
    if (exponent === 31) return sign * Infinity; // Infinity

    return sign * Math.pow(2, exponent - 15) * (1 + mantissa / 1024);
  }
  
};