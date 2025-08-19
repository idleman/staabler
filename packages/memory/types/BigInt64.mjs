import Int32 from './Int32.mjs';

/**
 * 64-bit signed integer type implementation with optimized byte-level access.
 * 
 * This class provides static methods for reading and writing 64-bit signed integers
 * to ArrayBuffer views, handling the conversion between JavaScript BigInt and
 * the underlying binary representation.
 */
export default class BigInt64 {

  /** Number of bytes required to store a 64-bit integer */
  static BYTES_PER_ELEMENT = 8;

  /**
   * Reads a 64-bit signed integer from a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to read from
   * @param {number} [byteOffset=0] - The byte offset to read from
   * @returns {bigint} The 64-bit signed integer value
   */
  static getValue(buffer, byteOffset = 0) {
    // Read both 32-bit parts as signed integers
    const low = Int32.getValue(buffer, byteOffset);
    const high = Int32.getValue(buffer, byteOffset + 4);

    // Convert to BigInt, properly handling the sign
    // If high is negative, we need to sign-extend it
    const highBig = BigInt(high);
    const lowBig = BigInt(low >>> 0); // Convert to unsigned for proper bit manipulation
    
    // Combine the parts, handling the sign bit
    return (highBig << BigInt(32)) | lowBig;
  }

  /**
   * Writes a 64-bit signed integer to a buffer at the specified byte offset.
   * 
   * @param {ArrayBuffer|TypedArray} buffer - The buffer to write to
   * @param {number} [byteOffset=0] - The byte offset to write to
   * @param {bigint|number} value - The 64-bit signed integer value to write
   */
  static setValue(buffer, byteOffset, value) {
    // Convert to BigInt if not already
    const bigValue = BigInt(value);
    
    // Extract lower 32 bits (unsigned)
    const low = Number(bigValue & BigInt(0xFFFFFFFF));
    Int32.setValue(buffer, byteOffset, low);

    // Extract upper 32 bits (signed)
    const high = Number(bigValue >> BigInt(32));
    Int32.setValue(buffer, byteOffset + 4, high);
  }
  
};