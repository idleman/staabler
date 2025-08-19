/**
 * Raw bytes type implementation.
 * Provides efficient handling of binary data as Uint8Array views.
 */
export default class Bytes {
  
  /**
   * Gets a Uint8Array view of bytes from a buffer at the specified offset.
   * 
   * @param {Uint8Array} bufferOrArray - The buffer to read from
   * @param {number} [byteOffset=0] - Byte offset within the buffer
   * @param {number} [byteLength=0] - Number of bytes to read
   * @returns {Uint8Array} A view of the specified bytes
   */
  static getValue(bufferOrArray, byteOffset = 0, byteLength = 0) {
    return bufferOrArray.subarray(byteOffset, byteOffset + byteLength);
  }

  /**
   * Sets bytes in a buffer at the specified offset.
   * 
   * @param {Uint8Array} buffer - The buffer to write to
   * @param {number} byteOffset - Byte offset within the buffer
   * @param {Uint8Array} value - The bytes to write
   * @param {number} [byteLength=0] - Number of bytes to write
   */
  static setValue(buffer, byteOffset, value, byteLength = 0) {
    Bytes.getValue(buffer, byteOffset, byteLength).set(value);
  }
  
  /**
   * Gets the byte length of a value.
   * 
   * @param {Uint8Array} value - The value to get the byte length for
   * @returns {number} The byte length of the value
   */
  static getByteLengthOf(value) {
    return value.byteLength;
  }
  
};