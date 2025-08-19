import getPackageName from './getPackageName.mjs';
import isWeakable from './isWeakable.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should return true if the value can be used in  a Weak collection', function() {

    strictEqual(isWeakable(), false);
    strictEqual(isWeakable(1), false);
    strictEqual(isWeakable(null), false);
    strictEqual(isWeakable({}), true);
    strictEqual(isWeakable(() => 123), true);

  });

});