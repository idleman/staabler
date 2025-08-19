import getPackageName from './getPackageName.mjs';
import withValue from './withValue.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should resolve the value if needed and return handler(value)', async function() {
    const multiply = val => val * 2;
    strictEqual(withValue(123, multiply), 123*2);
    strictEqual(await withValue(Promise.resolve(123), multiply), 123*2);
  });

});