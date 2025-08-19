import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import toISOString from './toISOString.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should pascal case a string', function() {
    strictEqual(toISOString(0), '1970-01-01T00:00:00.000Z');
    const now = new Date();
    const ms = now.getTime();
    const iso = now.toISOString();
    strictEqual(toISOString(ms), iso);
  });

});