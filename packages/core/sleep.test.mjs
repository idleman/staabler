import getPackageName from './getPackageName.mjs';
import sleep from './sleep.mjs';
import isThenable from './isThenable.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should return a promise that resolve after N ms', async function() {
    const time = 7;
    const now = performance.now();
    const promise = sleep(time);
    strictEqual(isThenable(promise), true);
    await promise;
    const elapsed = performance.now() - now;
    strictEqual(time <= elapsed, true);
  });

  it('should be possible to abort', async function() {
    const time = 7;
    const now = performance.now();
    const promise = sleep(time);
    promise.abort();
    await promise;
    const elapsed = performance.now() - now;
    strictEqual(elapsed <= time, true);
  });

});