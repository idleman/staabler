import getPackageName from './getPackageName.mjs';
import sleep from './sleep.mjs';
import withDelay from './withDelay.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should call a function after specific amount of time', async function() {
    const history = [];
    const cb = withDelay(5, () => (history.push(Date.now()), 123));
    strictEqual(cb(), void(0));
    strictEqual(history.length, 0);
    await sleep(6);
    strictEqual(history.length, 1);
  });

});