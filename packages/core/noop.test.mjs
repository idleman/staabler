import getPackageName from './getPackageName.mjs';
import noop from './noop.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should always return undefined', function() {

    strictEqual(noop(), void(0));
    strictEqual(noop({}), void(0));
    strictEqual(noop(null), void(0));

  });

});