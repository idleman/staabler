import getPackageName from './getPackageName.mjs';
import isNullish from './isNullish.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should return true on undefined and null', function() {

    strictEqual(isNullish(), true);
    strictEqual(isNullish(null), true);
    strictEqual(isNullish(void(0)), true);
    strictEqual(isNullish(false), false);
    strictEqual(isNullish(0), false);
    strictEqual(isNullish(''), false);
    strictEqual(isNullish(NaN), false);

  });

});