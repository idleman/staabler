import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import tokenize from './tokenize.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should calcullate the levenshtein distance', function() {
    const str = 'Hello, world! Привет, мир! こんにちは、世界！';
    const tokens = tokenize(str);
    strictEqual(tokens.length, 6);
    strictEqual(tokens[0], 'Hello');
    strictEqual(tokens[1], 'world');
    strictEqual(tokens[2], 'Привет');
    strictEqual(tokens[3], 'мир');
    strictEqual(tokens[4], 'こんにちは');
    strictEqual(tokens[5], '世界');
  });

});