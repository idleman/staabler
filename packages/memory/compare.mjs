import getObjectPool from '@staabler/core/getObjectPool.mjs';

/**
 * Compares two ArrayBuffer objects byte by byte.
 * 
 * @param {ArrayBuffer} b1 - The first buffer to compare
 * @param {ArrayBuffer} b2 - The second buffer to compare
 * @param {number} [byteOffset1=0] - Starting byte offset in the first buffer
 * @param {number} [byteOffset2=0] - Starting byte offset in the second buffer
 * @param {number} [byteLength=Infinity] - Maximum number of bytes to compare
 * @returns {number} Returns -1 if b1 < b2, 0 if equal, 1 if b1 > b2
 */
export default function compare(b1, b2, byteOffset1 = 0, byteOffset2 = 0, byteLength = Infinity) {
  
  const length = Math.min(
    byteLength,
    b1.byteLength - byteOffset1,
    b2.byteLength - byteOffset2
  );

  return getObjectPool(DataView, b1).use(v1 => {
    return getObjectPool(DataView, b2).use(v2 => {
      for(let i = 0; i < length; ++i) {
        const a = v1.getUint8(i + byteOffset1);
        const b = v2.getUint8(i + byteOffset2);
        if(a !== b) {
          return a < b ? -1 : 1;
        }
      }
      return 0;    
    });
  });
};