import getPackageName from '@staabler/core/getPackageName.mjs';
import compare from './compare.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {  

  it('should return zero if equal', function() {
    const a = new Uint8Array([0,1]);
    const b = new Uint8Array([0,1]);
    strictEqual(compare(a.buffer, b.buffer), 0);
  });
  
  it('should return -1 if the first is less than the second', function() {
    const a = new Uint8Array([0,0]);
    const b = new Uint8Array([0,1]);
    strictEqual(compare(a.buffer, b.buffer), -1);
  });

  it('should return 1 if the second is less than the first one', function() {
    const a = new Uint8Array([0,1]);
    const b = new Uint8Array([0,0]);
    strictEqual(compare(a.buffer, b.buffer), 1);
  });


  it('should work with offsets', function() {
    {
      const a = new Uint8Array([0, 1, 0, 0, 0]); //   1 offset,
      const b = new Uint8Array([0, 0, 1, 0, 1, 0]); // 2 offset
      strictEqual(compare(a.buffer, b.buffer, 2, 3, 2), -1);
    }

    {
      const a = new Uint8Array([0, 1, 0, 2, 0]); //   1 offset,
      const b = new Uint8Array([0, 0, 1, 0, 1, 0]); // 2 offset
      strictEqual(compare(a.buffer, b.buffer, 2, 3, 2), 1);
    }
  });

  return;  
  it.only('should work', function() {
 
    {

      const a = new Uint8Array([0,1]);
      const b = new Uint8Array([0,1]);
      strictEqual(compare(a, b), 0);
    }
    const createBuffer = (...args) => (new Uint8Array(args)).buffer;
    strictEqual(compare(createBuffer(0), createBuffer(0)), 0);
    strictEqual(compare(createBuffer(1), createBuffer(0)), 1);
    strictEqual(compare(createBuffer(0), createBuffer(1)), -1);
  });


});