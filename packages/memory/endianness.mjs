/**
 * Detects the endianness of the current system by examining how a 32-bit integer
 * is stored in memory.
 */
const uInt32 = new Uint32Array([0x11223344]);
const uInt8 = new Uint8Array(uInt32.buffer);

/**
 * Indicates whether the system uses big-endian byte order.
 * @type {boolean}
 */
export const isBigEndian = uInt8[0] === 0x11;

/**
 * Indicates whether the system uses little-endian byte order.
 * @type {boolean}
 */
export const isLittleEndian = (uInt8[0] === 0x44);