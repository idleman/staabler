import getPackageName from '@staabler/core/getPackageName.mjs';
import setBit from './setBit.mjs';
import { strictEqual } from 'node:assert';


describe(getPackageName(import.meta.url), function() {
  
  it('should set the bit value at a specific index', function() {
    strictEqual(setBit(0, 0).toString(2), '1');

    strictEqual(setBit(0, 1).toString(2), '10');

    strictEqual(setBit(5, 1).toString(2), '111');
    strictEqual(setBit(8, 2).toString(2), '1100');
    strictEqual(setBit(15, 0, 0).toString(2), '1110');
    strictEqual(setBit(15, 1, 0).toString(2), '1101');
    strictEqual(setBit(15, 2, 0).toString(2), '1011');
    strictEqual(setBit(15, 3, 0).toString(2), '111');
  });

});