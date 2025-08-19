import getPackageName from './getPackageName.mjs';
import sleep from './sleep.mjs';
import { deepEqual, strictEqual } from 'node:assert';
import withParallelLimit from './withParallelLimit.mjs';

describe(getPackageName(import.meta.url), function() {
  
  function createTask(result, pending, max = 1, ms = 5) {
    return async value => {
      const taskId = Math.random();
      result.push(value);
      pending.add(taskId);
      strictEqual(pending.size <= max, true);
      const time = Math.round(Math.random()*ms);
      if(time) {
        await sleep(time);
      }
      strictEqual(pending.size <= max, true);
      pending.delete(taskId);
    };
  }

  it('should limit parallel invocations', async function() {

    const result = [];
    const pending = new Set();
    const limit = 1 + Math.round(Math.random() * 8);
    const cb = withParallelLimit(limit, createTask(result, pending, limit));
    
    const length = 50;
    const expect = Array.from({ length }, (_, index) => index + 1);
    await Promise.all(expect.map(val => cb(val)));
    deepEqual(result, expect);
  });

});