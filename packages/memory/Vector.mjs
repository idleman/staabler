import { isLittleEndian } from './endianness.mjs';
import getObjectPool from '@staabler/core/getObjectPool.mjs';

/**
 * A memory-efficient vector implementation that provides typed array access methods.
 * Supports dynamic resizing and efficient memory management.
 */
export default class Vector {

  /**
   * Default maximum byte length for vector buffers.
   * @type {number}
   */
  static defaultMaxByteLength = 2**16;

  /**
   * Creates a new Vector instance.
   * 
   * @param {ArrayBuffer|SharedArrayBuffer} [buffer=new ArrayBuffer(0, { maxByteLength: Vector.defaultMaxByteLength })] - The underlying buffer
   * @param {number} [byteOffset=0] - Byte offset within the buffer
   */
  constructor(buffer = new ArrayBuffer(0, { maxByteLength: Vector.defaultMaxByteLength }), byteOffset = 0) {
    this.buffer = buffer;
    this.byteOffset = byteOffset;
    this.byteLength = buffer.byteLength;
  }

  /**
   * Resizes the vector to the specified length.
   * 
   * @param {number} [len=0] - New length for the vector
   * @returns {Vector} This instance for chaining
   */
  resize(len = 0) {
    this.byteLength = len < 0 ? 0 : len;
    
    const buffer = this.buffer;
    const realByteLength = buffer.byteLength;
    if(this.byteLength <= realByteLength) {
      return this;
    }
    
    //console.log('resize', realByteLength)
    buffer.resize(Math.max(this.byteLength, Math.min(buffer.maxByteLength, realByteLength * 2)));
    return this;
  }

  /**
   * Sets an 8-bit signed integer value at the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @param {number} [value=0] - Value to set
   * @returns {number} The set value
   */
  setInt8(byteOffset = 0, value = 0) {
    getObjectPool(DataView, this.buffer).use(view => view.setInt8(this.byteOffset + byteOffset, value));
    return value;
  }

  /**
   * Gets an 8-bit signed integer value from the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @returns {number} The retrieved value
   */
  getInt8(byteOffset = 0) {
    return getObjectPool(DataView, this.buffer).use(view => view.getInt8(this.byteOffset + byteOffset));
  }

  /**
   * Pushes an 8-bit signed integer value to the end of the vector.
   * 
   * @param {number} [value=0] - Value to push
   * @returns {number} The pushed value
   */
  pushInt8(value = 0) {
    const byteOffset = this.byteLength;
    this.resize(byteOffset + 1);
    return this.setInt8(byteOffset - this.byteOffset, value);
  }

  /**
   * Shifts (removes and returns) an 8-bit signed integer value from the beginning of the vector.
   * 
   * @returns {number} The shifted value
   */
  shiftInt8() {
    const value = this.getInt8(0);
    this.byteOffset += 1;
    return value;
  }

  /**
   * Sets an 8-bit unsigned integer value at the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @param {number} [value=0] - Value to set
   * @returns {number} The set value
   */
  setUint8(byteOffset = 0, value = 0) {
    getObjectPool(DataView, this.buffer).use(view => view.setUint8(this.byteOffset + byteOffset, value));
    return value;
  }

  /**
   * Gets an 8-bit unsigned integer value from the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @returns {number} The retrieved value
   */
  getUint8(byteOffset = 0) {
    return getObjectPool(DataView, this.buffer).use(view => view.getUint8(this.byteOffset + byteOffset));
  }

  /**
   * Pushes an 8-bit unsigned integer value to the end of the vector.
   * 
   * @param {number} [value=0] - Value to push
   * @returns {number} The pushed value
   */
  pushUint8(value = 0) {
    const byteOffset = this.byteLength;
    this.resize(byteOffset + 1);
    return this.setUint8(byteOffset - this.byteOffset, value);
  }

  /**
   * Shifts (removes and returns) an 8-bit unsigned integer value from the beginning of the vector.
   * 
   * @returns {number} The shifted value
   */
  shiftUint8() {
    const value = this.getUint8(0);
    this.byteOffset += 1;
    return value;
  }

  /**
   * Sets a 16-bit signed integer value at the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @param {number} [value=0] - Value to set
   * @returns {number} The set value
   */
  setInt16(byteOffset = 0, value = 0) {
    getObjectPool(DataView, this.buffer).use(view => view.setInt16(this.byteOffset + byteOffset, value, isLittleEndian));
    return value;
  }

  /**
   * Gets a 16-bit signed integer value from the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @returns {number} The retrieved value
   */
  getInt16(byteOffset = 0) {
    return getObjectPool(DataView, this.buffer).use(view => view.getInt16(this.byteOffset + byteOffset, isLittleEndian));
  }

  /**
   * Pushes a 16-bit signed integer value to the end of the vector.
   * 
   * @param {number} [value=0] - Value to push
   * @returns {number} The pushed value
   */
  pushInt16(value = 0) {
    const byteOffset = this.byteLength;
    this.resize(byteOffset + 2);
    return this.setInt16(byteOffset - this.byteOffset, value);
  }

  /**
   * Shifts (removes and returns) a 16-bit signed integer value from the beginning of the vector.
   * 
   * @returns {number} The shifted value
   */
  shiftInt16() {
    const value = this.getInt16(0);
    this.byteOffset += 2;
    return value;
  }

  /**
   * Sets a 16-bit unsigned integer value at the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @param {number} [value=0] - Value to set
   * @returns {number} The set value
   */
  setUint16(byteOffset = 0, value = 0) {
    getObjectPool(DataView, this.buffer).use(view => view.setUint16(this.byteOffset + byteOffset, value, isLittleEndian));
    return value;
  }

  /**
   * Gets a 16-bit unsigned integer value from the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @returns {number} The retrieved value
   */
  getUint16(byteOffset = 0) {
    return getObjectPool(DataView, this.buffer).use(view => view.getUint16(this.byteOffset + byteOffset, isLittleEndian));
  }

  /**
   * Pushes a 16-bit unsigned integer value to the end of the vector.
   * 
   * @param {number} [value=0] - Value to push
   * @returns {number} The pushed value
   */
  pushUint16(value = 0) {
    const byteOffset = this.byteLength;
    this.resize(byteOffset + 2);
    return this.setUint16(byteOffset - this.byteOffset, value);
  }

  /**
   * Shifts (removes and returns) a 16-bit unsigned integer value from the beginning of the vector.
   * 
   * @returns {number} The shifted value
   */
  shiftUint16() {
    const value = this.getUint16(0);
    this.byteOffset += 2;
    return value;
  }

  /**
   * Sets a 32-bit signed integer value at the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @param {number} [value=0] - Value to set
   * @returns {number} The set value
   */
  setInt32(byteOffset = 0, value = 0) {
    getObjectPool(DataView, this.buffer).use(view => view.setInt32(this.byteOffset + byteOffset, value, isLittleEndian));
    return value;
  }

  /**
   * Gets a 32-bit signed integer value from the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @returns {number} The retrieved value
   */
  getInt32(byteOffset = 0) {
    return getObjectPool(DataView, this.buffer).use(view => view.getInt32(this.byteOffset + byteOffset, isLittleEndian));
  }

  /**
   * Pushes a 32-bit signed integer value to the end of the vector.
   * 
   * @param {number} [value=0] - Value to push
   * @returns {number} The pushed value
   */
  pushInt32(value = 0) {
    const byteOffset = this.byteLength;
    this.resize(byteOffset + 4);
    return this.setInt32(byteOffset - this.byteOffset, value);
  }

  /**
   * Shifts (removes and returns) a 32-bit signed integer value from the beginning of the vector.
   * 
   * @returns {number} The shifted value
   */
  shiftInt32() {
    const value = this.getInt32(0);
    this.byteOffset += 4;
    return value;
  }

  /**
   * Sets a 32-bit unsigned integer value at the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @param {number} [value=0] - Value to set
   * @returns {number} The set value
   */
  setUint32(byteOffset = 0, value = 0) {
    getObjectPool(DataView, this.buffer).use(view => view.setUint32(this.byteOffset + byteOffset, value, isLittleEndian));
    return value;
  }

  /**
   * Gets a 32-bit unsigned integer value from the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @returns {number} The retrieved value
   */
  getUint32(byteOffset = 0) {
    return getObjectPool(DataView, this.buffer).use(view => view.getUint32(this.byteOffset + byteOffset, isLittleEndian));
  }
  
  /**
   * Pushes a 32-bit unsigned integer value to the end of the vector.
   * 
   * @param {number} [value=0] - Value to push
   * @returns {number} The pushed value
   */
  pushUint32(value = 0) {
    const byteOffset = this.byteLength;
    this.resize(byteOffset + 4);
    return this.setUint32(byteOffset - this.byteOffset, value);
  }

  /**
   * Shifts (removes and returns) a 32-bit unsigned integer value from the beginning of the vector.
   * 
   * @returns {number} The shifted value
   */
  shiftUint32() {
    const value = this.getUint32(0);
    this.byteOffset += 4;
    return value;
  }

  /**
   * Sets a 64-bit signed BigInt value at the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @param {bigint} [value=0n] - Value to set
   * @returns {bigint} The set value
   */
  setBigInt64(byteOffset = 0, value = 0) {
    getObjectPool(DataView, this.buffer).use(view => view.setBigInt64(this.byteOffset + byteOffset, value, isLittleEndian));
    return value;
  }

  /**
   * Gets a 64-bit signed BigInt value from the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @returns {bigint} The retrieved value
   */
  getBigInt64(byteOffset = 0) {
    return getObjectPool(DataView, this.buffer).use(view => view.getBigInt64(this.byteOffset + byteOffset, isLittleEndian));
  }

  /**
   * Pushes a 64-bit signed BigInt value to the end of the vector.
   * 
   * @param {bigint} [value=0n] - Value to push
   * @returns {bigint} The pushed value
   */
  pushBigInt64(value = 0) {
    const byteOffset = this.byteLength;
    this.resize(byteOffset + 8);
    return this.setBigInt64(byteOffset - this.byteOffset, value);
  }

  /**
   * Shifts (removes and returns) a 64-bit signed BigInt value from the beginning of the vector.
   * 
   * @returns {bigint} The shifted value
   */
  shiftBigInt64() {
    const value = this.getBigInt64(0);
    this.byteOffset += 8;
    return value;
  }

  /**
   * Sets a 64-bit unsigned BigInt value at the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @param {bigint} [value=0n] - Value to set
   * @returns {bigint} The set value
   */
  setBigUint64(byteOffset = 0, value = 0) {
    getObjectPool(DataView, this.buffer).use(view => view.setBigUint64(this.byteOffset + byteOffset, value, isLittleEndian));
    return value;
  }

  /**
   * Gets a 64-bit unsigned BigInt value from the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @returns {bigint} The retrieved value
   */
  getBigUint64(byteOffset = 0) {
    return getObjectPool(DataView, this.buffer).use(view => view.getBigUint64(this.byteOffset + byteOffset, isLittleEndian));
  }

  /**
   * Pushes a 64-bit unsigned BigInt value to the end of the vector.
   * 
   * @param {bigint} [value=0n] - Value to push
   * @returns {bigint} The pushed value
   */
  pushBigUint64(value = 0) {
    const byteOffset = this.byteLength;
    this.resize(byteOffset + 8);
    return this.setBigUint64(byteOffset - this.byteOffset, value);
  }

  /**
   * Shifts (removes and returns) a 64-bit unsigned BigInt value from the beginning of the vector.
   * 
   * @returns {bigint} The shifted value
   */
  shiftBigUint64() {
    const value = this.getBigUint64(0);
    this.byteOffset += 8;
    return value;
  }

  /**
   * Sets a 32-bit float value at the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @param {number} [value=0.0] - Value to set
   * @returns {number} The set value
   */
  setFloat32(byteOffset = 0, value = 0) {
    getObjectPool(DataView, this.buffer).use(view => view.setFloat32(this.byteOffset + byteOffset, value, isLittleEndian));
    return value;
  }

  /**
   * Gets a 32-bit float value from the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @returns {number} The retrieved value
   */
  getFloat32(byteOffset = 0) {
    return getObjectPool(DataView, this.buffer).use(view => view.getFloat32(this.byteOffset + byteOffset, isLittleEndian));
  }

  /**
   * Pushes a 32-bit float value to the end of the vector.
   * 
   * @param {number} [value=0.0] - Value to push
   * @returns {number} The pushed value
   */
  pushFloat32(value = 0.0) {
    const byteOffset = this.byteLength;
    this.resize(byteOffset + 4);
    return this.setFloat32(byteOffset - this.byteOffset, value);
  }

  /**
   * Shifts (removes and returns) a 32-bit float value from the beginning of the vector.
   * 
   * @returns {number} The shifted value
   */
  shiftFloat32() {
    const value = this.getFloat32(0);
    this.byteOffset += 4;
    return value;
  }

  /**
   * Sets a 64-bit float value at the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @param {number} [value=0.0] - Value to set
   * @returns {number} The set value
   */
  setFloat64(byteOffset = 0, value = 0) {
    getObjectPool(DataView, this.buffer).use(view => view.setFloat64(this.byteOffset + byteOffset, value, isLittleEndian));
    return value;
  }

  /**
   * Gets a 64-bit float value from the specified offset.
   * 
   * @param {number} [byteOffset=0] - Byte offset within the vector
   * @returns {number} The retrieved value
   */
  getFloat64(byteOffset = 0) {
    return getObjectPool(DataView, this.buffer).use(view => view.getFloat64(this.byteOffset + byteOffset, isLittleEndian));
  }

  /**
   * Pushes a 64-bit float value to the end of the vector.
   * 
   * @param {number} [value=0.0] - Value to push
   * @returns {number} The pushed value
   */
  pushFloat64(value = 0.0) {
    const byteOffset = this.byteLength;
    this.resize(byteOffset + 8);
    return this.setFloat64(byteOffset - this.byteOffset, value);
  }

  /**
   * Shifts (removes and returns) a 64-bit float value from the beginning of the vector.
   * 
   * @returns {number} The shifted value
   */
  shiftFloat64() {
    const value = this.getFloat64(0);
    this.byteOffset += 8;
    return value;
  }

};