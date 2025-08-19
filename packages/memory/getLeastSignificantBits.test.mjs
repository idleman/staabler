import { strictEqual } from 'node:assert';
import getPackageName from '@staabler/core/getPackageName.mjs';
import getLeastSignificantBits from './getLeastSignificantBits.mjs';


describe(getPackageName(import.meta.url), function() {
  
  it('should take least significant bits', function() {
    strictEqual(getLeastSignificantBits(4, 3).toString(2), '100');
    strictEqual(getLeastSignificantBits(15, 4).toString(2), '1111');
    strictEqual(getLeastSignificantBits(4, 3, 1).toString(2), '10');
    strictEqual(getLeastSignificantBits(15, 4, 3).toString(2), '1');
  });

});