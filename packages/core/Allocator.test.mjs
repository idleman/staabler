import getPackageName from './getPackageName.mjs';
import Allocator from './Allocator.mjs';
import { strictEqual, notStrictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  describe('#allocate+deallocate', function() {

    it('should by default allocate by fixed block-length', function() {
      const allocator = new Allocator();
      const buffer = allocator.allocate(200);
      strictEqual(buffer.byteLength, 256);
    });

    it('should by default return a ArrayByffer', function() {
      const allocator = new Allocator();
      const buffer = allocator.allocate(200);
      strictEqual(buffer instanceof ArrayBuffer, true);
    });

    it('should re-use instances if possible', function() {
      const allocator = new Allocator();
      const first = allocator.allocate(200);
      const second = allocator.allocate(200);
      notStrictEqual(first, second);
      allocator.deallocate(first);
      const third = allocator.allocate(200);
      strictEqual(first, third);
    });

    const { SharedArrayBuffer } = globalThis;
    if(SharedArrayBuffer) {

      it('should be possible to change ArrayType', function() {
        const allocator = new Allocator(SharedArrayBuffer);
        const buffer = allocator.allocate(200);
        strictEqual(buffer instanceof SharedArrayBuffer, true);
      });

    }

  });



  describe('#construct+destruct', function() {

    it('should by default construct a Uint8Array', function() {
      const allocator = new Allocator();
      const buffer = allocator.allocate(250);
      allocator.deallocate(buffer); // ensure i
      const array = allocator.construct(200);
      strictEqual(array instanceof Uint8Array, true);
      strictEqual(array.byteLength, 200);
      strictEqual(array.buffer, buffer);
    });

    it('should be possible to other types of TypedArrays', function() {
      const allocator = new Allocator();
      const array = allocator.construct(200, Uint32Array);
      strictEqual(array instanceof Uint32Array, true);
    });

    it('should use a memory buffer from allocate() ', function() {
      const Type = globalThis.SharedArrayBuffer || ArrayBuffer;
      const allocator = new Allocator(Type);
      const array = allocator.construct(100, Uint16Array);
      strictEqual(array.length, 100);
      strictEqual(array.byteLength, 200);
      strictEqual(array.buffer.byteLength, 256);
      strictEqual(array.buffer instanceof Type, true);
    });

  });

});