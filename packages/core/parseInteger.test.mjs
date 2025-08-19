import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import parseInteger from './parseInteger.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should work as expected', function() {

    strictEqual(parseInteger(10), 10);
    strictEqual(parseInteger('123'), 123);
    strictEqual(parseInteger(), void(0));
    strictEqual(parseInteger('hihi'), void(0));
    strictEqual(parseInteger('hihi', 321), 321);
  });

  it('should parse non-valid numbers as void() or default value', function() {
    // These values are not considered valid numbers.
    strictEqual(parseInteger('7e2'), void(0));
    strictEqual(parseInteger('95qwerty', 500), 500);
    strictEqual(parseInteger('95qwerty'), void(0));
  });
});