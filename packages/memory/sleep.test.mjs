import getPackageName from '@staabler/core/getPackageName.mjs';
import sleep from './sleep.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {
  
  it('should be able to sleep N ms', function() {
    const time = 5 + Math.round(Math.random()*10);
    const start = performance.now();
    sleep(time);
    const end = performance.now();
    const diff = end - start;
    strictEqual(time <= diff, true);
  });

});