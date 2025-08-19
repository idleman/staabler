import getPackageName from './getPackageName.mjs';
import isThenable from './isThenable.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should return true if the provided object has a ".then" method', function() {

    strictEqual(isThenable(), false);
    strictEqual(isThenable(null), false);
    strictEqual(isThenable({}), false);
    strictEqual(isThenable({ then() { } }), true);
    strictEqual(isThenable({ then: true }), false);

  });

});