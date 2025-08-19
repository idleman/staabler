import sleep from './sleep.mjs';
import Executor from './Executor.mjs';
import { strictEqual } from 'node:assert';
import getPackageName from './getPackageName.mjs';
import ExecutorStrand from './ExecutorStrand.mjs';

describe(getPackageName(import.meta.url), function() {
  
  it('should only allow one concurrent task', async function() {    
    let parallel = 0;
    const history = [];
    const executor = new Executor();
    const strand = new ExecutorStrand(executor)
    const stop = () => history.push(--parallel);
    const start = ms => {
      history.push(++parallel);
      return ms ? sleep(ms).then(stop) : stop();
    };

    for(let i = 0; i < 4; ++i) {
      strand.post(() => start(i));
    }
    strictEqual(4, await executor.run());
    strictEqual(history.every(val => val <= 1), true);
  });

});