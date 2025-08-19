import getPackageName from './getPackageName.mjs';
import withCache from './withCache.mjs';
import { strictEqual, notStrictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should memoize a function using the provided map', function() {
    const map = new Map();
    const construct = withCache(map, message => ({ message }));

    const first = construct('first');
    strictEqual(first, construct('first'));
    const second = construct('second');
    notStrictEqual(first, second);
    strictEqual(second, construct('second'));

    strictEqual(map.get('first'), first);
    strictEqual(map.get('second'), second);
  });

});