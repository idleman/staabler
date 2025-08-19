import getPackageName from './getPackageName.mjs';
import withDebounce from './withDebounce.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should return a function', function() {
    const cb = withDebounce(() => null);
    strictEqual(typeof cb, 'function');
  });

  it('should forward the function call at first call', async function() {
    const history = [];
    const ms = 1;
    const cb = withDebounce(ms, (...args) => history.push(args));
    cb(1,2,3);
    await new Promise(resolve => setTimeout(resolve, ms + 1));
    strictEqual(history.length, 1);
    strictEqual(JSON.stringify(history[0]), JSON.stringify([1, 2, 3]));
  });

  it('should only invoke the last caller', async function() {
    const history = [];
    const ms = 1;
    const cb = withDebounce(ms, (val) => history.push(val));
    cb(1);
    cb(2);
    cb(3);
    await new Promise(resolve => setTimeout(resolve, ms + 1));
    cb(4);
    cb(5);
    await new Promise(resolve => setTimeout(resolve, ms + 1));
    cb(6);
    cb(7);
    await new Promise(resolve => setTimeout(resolve, ms + 1));
    strictEqual(history.length, 3);
    strictEqual(JSON.stringify(history), JSON.stringify([3, 5, 7]));
  });

});