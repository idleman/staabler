import getPackageName from './getPackageName.mjs';
import tryCatch from './tryCatch.mjs';
import { strictEqual } from 'node:assert';
import withCallOnce from './withCallOnce.mjs';

describe(getPackageName(import.meta.url), function() {


  it('should forward the function call only the first time', async function() {
    const history = [];
    const cb = withCallOnce((...args) => history.push(args));
    cb(1,2);
    cb(3,4);
    strictEqual(history.length, 1);
    strictEqual(history[0].join(','), '1,2');
  });


  it('should alway throw the same eror in case it throws', async function() {
    const history = [];
    const cb = withCallOnce((...args) => {
      const err = new Error('My error');
      history.push([err, ...args]);
      throw err;
    });
    const [value1, error1] = tryCatch(() => cb(1, 2));
    const [value2, error2] = tryCatch(() => cb(3, 4));
    
    strictEqual(history.length, 1);
    const last = history.at(-1);
    strictEqual(last[0], error1);
    strictEqual(last[1], 1);
    strictEqual(last[2], 2);
  });



});