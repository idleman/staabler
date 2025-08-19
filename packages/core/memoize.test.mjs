import getPackageName from './getPackageName.mjs';
import memoize from './memoize.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should work', function() {

    const history = [];

    const add = memoize((...args) => {
      history.push(args);
      const [initial, ...rest] = args;
      return rest.reduce((s, v) => s + v.valueOf(), initial.valueOf());
    });

    strictEqual(add(1, 2, 3), 6);
    strictEqual(history.length, 1);
    strictEqual(history[0].join(','), '1,2,3');
    strictEqual(add(1, 2, 3), 6);
    strictEqual(history.length, 1);
    strictEqual(add(new Number(1), new Number(2)), 3);
    strictEqual(history.length, 2);
    strictEqual(history[1].join(','), '1,2');
    strictEqual(add(1, 2, 3), 6);
    strictEqual(history.length, 2);
  });

});