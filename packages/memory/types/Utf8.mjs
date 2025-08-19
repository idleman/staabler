/**
 * Decodes UTF-8 bytes from a buffer into a string.
 * Handles 1-4 byte UTF-8 sequences including surrogate pairs.
 * 
 * @param {Uint8Array} buffer - The buffer containing UTF-8 bytes
 * @param {number} offset - Starting byte offset
 * @param {number} byteLength - Number of bytes to decode
 * @returns {string} The decoded UTF-8 string
 */
function getUtf8(buffer, offset, byteLength) {
  let str = '';
  let pos = offset;
  let end = offset + byteLength;

  while (pos < end) {
    let byte1 = buffer[pos++];

    if ((byte1 & 0x80) === 0) {
      // 1-byte sequence (ASCII)
      str += String.fromCharCode(byte1);
    } else if ((byte1 & 0xE0) === 0xC0) {
      // 2-byte sequence
      let byte2 = buffer[pos++];
      str += String.fromCharCode(((byte1 & 0x1F) << 6) | (byte2 & 0x3F));
    } else if ((byte1 & 0xF0) === 0xE0) {
      // 3-byte sequence
      let byte2 = buffer[pos++];
      let byte3 = buffer[pos++];
      str += String.fromCharCode(
        ((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F)
      );
    } else {
      // 4-byte sequence (UTF-16 surrogate pair)
      let byte2 = buffer[pos++];
      let byte3 = buffer[pos++];
      let byte4 = buffer[pos++];
      let code =
        ((byte1 & 0x07) << 18) |
        ((byte2 & 0x3F) << 12) |
        ((byte3 & 0x3F) << 6) |
        (byte4 & 0x3F);
      code += 0x10000;
      str += String.fromCharCode(
        0xD800 | ((code >> 10) & 0x3FF),
        0xDC00 | (code & 0x3FF)
      );
    }
  }

  return str;
}

/**
 * Encodes a string into UTF-8 bytes and writes them to a buffer.
 * Handles 1-4 byte UTF-8 sequences including surrogate pairs.
 * 
 * @param {Uint8Array} buffer - The buffer to write UTF-8 bytes to
 * @param {number} offset - Starting byte offset
 * @param {string} str - The string to encode
 * @returns {number} Number of bytes written
 */
export function setUtf8(buffer, offset, str) {
  let i = 0, len = str.length;
  let pos = offset;

  while (i < len) {
    let code = str.charCodeAt(i++);

    if (code < 0x80) {
      // 1-byte sequence (ASCII)
      buffer[pos++] = code;
    } else if (code < 0x800) {
      // 2-byte sequence
      buffer[pos++] = 0xC0 | (code >> 6);
      buffer[pos++] = 0x80 | (code & 0x3F);
    } else if (code < 0x10000) {
      // 3-byte sequence
      buffer[pos++] = 0xE0 | (code >> 12);
      buffer[pos++] = 0x80 | ((code >> 6) & 0x3F);
      buffer[pos++] = 0x80 | (code & 0x3F);
    } else {
      // 4-byte sequence (UTF-16 surrogate pairs)
      code -= 0x10000;
      buffer[pos++] = 0xF0 | (code >> 18);
      buffer[pos++] = 0x80 | ((code >> 12) & 0x3F);
      buffer[pos++] = 0x80 | ((code >> 6) & 0x3F);
      buffer[pos++] = 0x80 | (code & 0x3F);
    }
  }

  return pos - offset; // Return number of bytes written
}

/**
 * UTF-8 string type implementation.
 * Provides optimized UTF-8 encoding and decoding with support for all Unicode characters.
 */
export default class Utf8 {

  /**
   * Gets a UTF-8 string value from a buffer at the specified offset.
   * 
   * @param {Uint8Array} buffer - The buffer to read from
   * @param {number} byteOffset - Byte offset within the buffer
   * @param {number} byteLength - Number of bytes to read
   * @returns {string} The decoded UTF-8 string
   */
  static getValue(buffer, byteOffset, byteLength) {
    return getUtf8(buffer, byteOffset, byteLength);
  }

  /**
   * Sets a UTF-8 string value in a buffer at the specified offset.
   * 
   * @param {Uint8Array} buffer - The buffer to write to
   * @param {number} byteOffset - Byte offset within the buffer
   * @param {string} value - The UTF-8 string to write
   * @returns {number} Number of bytes written
   */
  static setValue(buffer, byteOffset, value) {
    return setUtf8(buffer, byteOffset, value);
  }

  /**
   * Calculates the number of bytes required to store a UTF-8 string.
   * 
   * @param {string} [value=''] - The string to calculate byte length for
   * @returns {number} Number of bytes required to store the string in UTF-8
   */
  static getByteLengthOf(value = '') {
    let length = 0;
    for (let i = 0, len = value.length; i < len; i++) {
      let code = value.charCodeAt(i);
      length += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
    }
    return length;
  }
}
