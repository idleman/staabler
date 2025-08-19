import getBit from './getBit.mjs';
import { strictEqual } from 'node:assert';
import getPackageName from '@staabler/core/getPackageName.mjs';


describe(getPackageName(import.meta.url), function() {
  
  it('should return the bit value at a specific index', function() {
    strictEqual(getBit(0, 0), 0);
    strictEqual(getBit(1, 0), 1);
    strictEqual(getBit(2, 0), 0);
    strictEqual(getBit(3, 0), 1);
    strictEqual(getBit(5, 0), 1);
    strictEqual(getBit(5, 1), 0);
    strictEqual(getBit(5, 2), 1);

    strictEqual(getBit(5, 3), 0); // Out of bounds

    strictEqual(getBit(2**31, 31), 1);
    strictEqual(getBit(2**31-1, 31), 0);
  });

});