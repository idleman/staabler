import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import parseVersion from './parseVersion.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should convert a version string into a number', function() {
    const low = parseVersion('12.1');
    const middle = parseVersion('12.99');
    const high = parseVersion('13.1');
    strictEqual(low < high, true);
    strictEqual(low < middle, true);
    strictEqual(middle < high, true);
  });

  it('should handle none version string values', function() {
    strictEqual(parseVersion(''), 0);
    strictEqual(parseVersion(null), 0);
    strictEqual(parseVersion(100), 100);
  });

});