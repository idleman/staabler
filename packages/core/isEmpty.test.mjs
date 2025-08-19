import getPackageName from './getPackageName.mjs';
import isEmpty from './isEmpty.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {
  it('should return true if given an empty object', () => {
    strictEqual(isEmpty({}), true);
  });

  it('should return false if given an non-empty object', () => {
    strictEqual(isEmpty({ Hello: 'World' }), false);
  });
});