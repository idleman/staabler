import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import levenshtein from './levenshtein.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should calcullate the levenshtein distance', function() {
    strictEqual(levenshtein('a', 'b'), 1);
    strictEqual(levenshtein('ab', 'ac'), 1);
    strictEqual(levenshtein('ac', 'bc'), 1);
    strictEqual(levenshtein('abc', 'axc'), 1);
    strictEqual(levenshtein('kitten', 'sitting'), 3);
    strictEqual(levenshtein('xabxcdxxefxgx', '1ab2cd34ef5g6'), 6);
    strictEqual(levenshtein('cat', 'cow'), 2);
    strictEqual(levenshtein('xabxcdxxefxgx', 'abcdefg'), 6);
    strictEqual(levenshtein('abcdefg', 'xabxcdxxefxgx'), 6);
    strictEqual(levenshtein('javawasneat', 'scalaisgreat'), 7);
    strictEqual(levenshtein('example', 'samples'), 3);
    strictEqual(levenshtein('sturgeon', 'urgently'), 6);
    strictEqual(levenshtein('levenshtein', 'frankenstein'), 6);
    strictEqual(levenshtein('distance', 'difference'), 5);
    strictEqual(levenshtein('因為我是中國人所以我會說中文', '因為我是英國人所以我會說英文'), 2);
  });

});