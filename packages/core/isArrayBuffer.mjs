
const ArrayBuffer = globalThis.ArrayBuffer;
const MaybeSharedArrayBuffer = globalThis.SharedArrayBuffer ?? ArrayBuffer;

/**
 * Checks if an object is an ArrayBuffer or SharedArrayBuffer.
 * @param {any} obj - The object to check
 * @returns {boolean} True if the object is an ArrayBuffer or SharedArrayBuffer, false otherwise
 */
export default function isArrayBuffer(obj) {
  const constructor = obj?.constructor;
  return constructor === ArrayBuffer || constructor === MaybeSharedArrayBuffer;
};