import sleep from './sleep.mjs';
import Executor from './Executor.mjs';
import { strictEqual } from 'node:assert';
import getPackageName from './getPackageName.mjs';
import ExecutorWorkGuard from './ExecutorWorkGuard.mjs';

describe(getPackageName(import.meta.url), function() {
  
  it('should ensure the executor always has', async function() {    
    const executor = new Executor();
    const guard = new ExecutorWorkGuard(executor);
    strictEqual(guard.isEnabled(), true);
    strictEqual(guard.isDisabled(), false);
    const promise = executor.run();
    const result1 = await Promise.race([
      promise.then(() => 1),
      sleep(2).then(() => 2)
    ]);
    strictEqual(result1, 2);
    guard.disable();
    strictEqual(guard.isEnabled(), false);
    strictEqual(guard.isDisabled(), true);
    const result2 = await Promise.race([
      promise.then(() => 1),
      sleep(2).then(() => 2)
    ]);
    strictEqual(result2, 1);
  });

});