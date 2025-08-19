import getDataView from '../getDataView.mjs';

/**
 * 8-bit floating-point type implementation with optimized byte-level access.
 * 
 * This class provides static methods for reading and writing 8-bit floating-point
 * numbers to ArrayBuffer views using E5M2 format (similar to NVIDIA's FP8).
 * The format uses 1 sign bit, 5 exponent bits, and 2 mantissa bits.
 */
export default class Float8 {
  
  /** Number of bytes required to store an 8-bit float */
  static BYTES_PER_ELEMENT = 1;

  /**
   * Reads an 8-bit floating-point number from a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to read from
   * @param {number} [byteOffset=0] - The byte offset to read from
   * @returns {number} The 8-bit floating-point value decoded to Float32
   */
  static getValue(buffer, byteOffset = 0) {
    const uint8 = getDataView(buffer).getUint8(byteOffset);
    return Float8.decode(uint8);
  }

  /**
   * Writes an 8-bit floating-point number to a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to write to
   * @param {number} [byteOffset=0] - The byte offset to write to
   * @param {number} value - The floating-point value to encode and write
   */
  static setValue(buffer, byteOffset, value) {
    const view = getDataView(buffer);
    view.setUint8(byteOffset, Float8.encode(value));
  }

  /**
   * Encodes a Float32 value into Float8 format (E5M2).
   * 
   * @param {number} value - The Float32 value to encode
   * @returns {number} The encoded 8-bit value
   */
  static encode(value) {
    if (value === 0) return 0; // Zero shortcut
    
    const floatView = new Float32Array([value]);
    const intView = new Uint32Array(floatView.buffer);
    const sign = (intView[0] >> 31) & 0x1;
    let exponent = ((intView[0] >> 23) & 0xFF) - 127 + 15; // Adjust exponent bias
    let mantissa = (intView[0] >> 21) & 0x3; // Take 2 most significant bits

    if (exponent <= 0) return sign << 7; // Underflow, return zero
    if (exponent >= 31) return (sign << 7) | 0x7F; // Overflow, return Inf

    return (sign << 7) | (exponent << 2) | mantissa;
  }

  /**
   * Decodes a Float8 value (E5M2 format) into Float32.
   * 
   * @param {number} uint8 - The 8-bit encoded value
   * @returns {number} The decoded Float32 value
   */
  static decode(uint8) {
    const sign = (uint8 & 0x80) ? -1 : 1;
    let exponent = (uint8 >> 2) & 0x1F;
    let mantissa = uint8 & 0x3;

    if (exponent === 0) return 0; // Zero or denormalized numbers
    if (exponent === 31) return sign * Infinity; // Infinity

    return sign * Math.pow(2, exponent - 15) * (1 + mantissa / 4);
  }
  
};