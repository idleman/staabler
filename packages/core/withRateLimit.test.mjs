import { strictEqual } from 'node:assert';
import withRateLimit from './withRateLimit.mjs';
import getPackageName from './getPackageName.mjs';

describe(getPackageName(import.meta.url), function() {

  
  if((!process.env.GITHUB_ACTIONS) && Math.random() < 0.9) {
    //  It is hard to effective test a rate limit that should finish in short amount of time 
    //  do we only sometimes (10% of the times execute it locally.
    return;
  }

  it('should make never call the callback more than N times per second', async function() {
    this.timeout(110000);
    const history = [];
    const rate = 500;
    const length = rate*10;
    const cb = withRateLimit(rate, index => history.push([performance.now(), index]));
    const initial = performance.now();
    await Promise.all(Array.from({ length }, (_, index) => cb(index)));
    strictEqual(history.length, length);
    history.forEach((curr, index) => strictEqual(curr[1], index ));
    
    const diff = history.map(([date], index, arr) => date - (index === 0 ? initial : arr[index - 1][0]));
    const avg = (diff.reduce((s, v) => s + v, 0))/diff.length;
    const min = diff.reduce((s, val) => Math.min(s, val), 0);
    // const max = diff.reduce((s, val) => Math.max(s, val), 0);
    // console.log('avg', {
    //   avg,
    //   max,
    //   min
    // });
    
    
    strictEqual(min, 0);  // Allow burst
    strictEqual(Math.abs(2-avg) < 0.25, true); // 500 request per second => 2 ms 
  });
  
  //   const prev = index === 0 ? void(0) : history[index - 1];
  //   if(prev) {
  //     const elapsed = curr[0] - prev[0];
  //     strictEqual(speed <= elapsed, true, `Invoked too fast (${index}). Expected delay for at least ${speed} ms but got=${elapsed}. (curr=${prev[0]}, curr=${prev[0]})`);
  //   }
  //   //console.log(history);
  // });
});