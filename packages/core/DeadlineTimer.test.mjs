import sleep from './sleep.mjs';
import { strictEqual } from 'node:assert';
import DeadlineTimer from './DeadlineTimer.mjs';
import getPackageName from './getPackageName.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should fire a specific call back after N ms', async function() {
    const history = [];
    const timer = new DeadlineTimer(() => history.push(1), 1);
    strictEqual(history.length, 0);
    await sleep(5);
    strictEqual(history.join(','), '1');
  });

  it('should be able to abort', async function() {
    const history = [];
    const timer = new DeadlineTimer(() => history.push(1), 4);
    strictEqual(history.length, 0);
    await sleep(1);
    timer.abort();
    await sleep(5);
    strictEqual(history.length, 0);
  });

  it('should be able to reset', async function() {
    const history = [];
    const timer = new DeadlineTimer(() => history.push(1), 2);
    strictEqual(history.length, 0);
    await sleep(1);
    timer.reset(() => history.push(2));
    await sleep(3);
    strictEqual(history.join(','), '2');
  });

});