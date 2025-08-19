import sleep from './sleep.mjs';
import { strictEqual } from 'assert';
import getPackageName from './getPackageName.mjs';
import createAsyncIterator from './createAsyncIterator.mjs';

describe(getPackageName(import.meta.url), function () {
  
  it('should work as expected ', async function () {
    const arr = [sleep(5).then(() => '2'), sleep(1).then(() => '1')];
    const history = []; 
    for await (const value of createAsyncIterator(arr)) {
      history.push(value);
    }
    strictEqual(history[0], '1');
    strictEqual(history[1], '2');
  });

  it('should work as expected ', async function () {
    const arr = [sleep(2).then(() => '2'), '1'];
    const history = []; 
    for await (const value of createAsyncIterator(arr)) {
      history.push(value);
    }
    strictEqual(history[0], '1');
    strictEqual(history[1], '2');
  });

});