import Uint32 from './Uint32.mjs';

/**
 * 64-bit unsigned integer type implementation with optimized byte-level access.
 * 
 * This class provides static methods for reading and writing 64-bit unsigned integers
 * to ArrayBuffer views, handling the conversion between JavaScript BigInt and
 * the underlying binary representation.
 */
export default class BigUint64 {

  /** Number of bytes required to store a 64-bit integer */
  static BYTES_PER_ELEMENT = 8;

  /**
   * Reads a 64-bit unsigned integer from a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to read from
   * @param {number} [byteOffset=0] - The byte offset to read from
   * @returns {bigint} The 64-bit unsigned integer value
   */
  static getValue(buffer, byteOffset = 0) {
    // Reuse Uint32 to read both 32-bit parts
    const low = Uint32.getValue(buffer, byteOffset);
    const high = Uint32.getValue(buffer, byteOffset + 4);

    // Combine into BigInt
    return BigInt(high) * BigInt(0x100000000) + BigInt(low);
  }

  /**
   * Writes a 64-bit unsigned integer to a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to write to
   * @param {number} [byteOffset=0] - The byte offset to write to
   * @param {bigint|number} value - The 64-bit unsigned integer value to write
   */
  static setValue(buffer, byteOffset, value) {
    // Convert to BigInt if not already
    const bigValue = BigInt(value);
    
    // Extract and set lower 32 bits using Uint32
    const low = Number(bigValue & BigInt(0xFFFFFFFF));
    Uint32.setValue(buffer, byteOffset, low);

    // Extract and set upper 32 bits using Uint32
    const high = Number(bigValue >> BigInt(32));
    Uint32.setValue(buffer, byteOffset + 4, high);
  }

};