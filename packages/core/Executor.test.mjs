import sleep from './sleep.mjs';
import Executor from './Executor.mjs';
import { strictEqual } from 'node:assert';
import getPackageName from './getPackageName.mjs';


describe(getPackageName(import.meta.url), function() {
  
  describe('#poll+post', function() {

    it('should basic poll', function() {    
      const history = [];
      const scheduler = new Executor();
  
      strictEqual(scheduler.post(() => history.push(1)), scheduler);
      strictEqual(scheduler.post(() => history.push(2)), scheduler);
      strictEqual(history.length, 0);
  
      scheduler.poll();
      strictEqual(history.join(','), '1,2');
    });

  });
  
  describe('#run+post', function() {

    it('should await promises', async function() {    
      const history = [];
      const scheduler = new Executor();
  
      strictEqual(scheduler.post(() => history.push(1)), scheduler);
      strictEqual(scheduler.post(() => Promise.resolve(2).then(() => history.push(2))), scheduler);
      strictEqual(scheduler.post(() => history.push(3)), scheduler);
      strictEqual(history.length, 0);
  
      strictEqual(3, await scheduler.run());
      strictEqual(history.join(','), '1,3,2');
    });

    it('should allow to set a max duration', async function() {    
      const history = [];
      const scheduler = new Executor();
  
      strictEqual(scheduler.post(() => history.push(1)), scheduler);
      strictEqual(scheduler.post(() => sleep(5).then(() => history.push(2))), scheduler);
      strictEqual(scheduler.post(() => history.push(3)), scheduler);
      strictEqual(history.length, 0);
  
      await scheduler.run(3);
      strictEqual(history.join(','), '1,3');
    });
    
    it('should immediately call handlers if possible', async function() {    
      const history = [];
      const scheduler = new Executor();
  

      scheduler.post(() => history.push(1));
      const resolver = Promise.withResolvers();
      scheduler.post(() => resolver.promise);
      const promise = scheduler.run();
      scheduler.dispatch(() => {
        setTimeout(() => {
          history.push(2);
          resolver.resolve();
        }, 1);
      });
      await Promise.all([promise, resolver.promise]);
      
      strictEqual(history.join(','), '1,2');

    });

    it('should swallow all errors', async function() {    
      const errors = [];
      const scheduler = new Executor({
        error(err) {
          errors.push(err);
        }
      });
  
      const syncError = new Error();
      const asyncError = new Error();
      scheduler.post(() => { throw syncError; });
      scheduler.post(async () => {
        await sleep(1);
        throw asyncError;
      });
      
      await scheduler.run();
      strictEqual(errors.length, 2);
      strictEqual(errors[0], syncError);
      strictEqual(errors[1], asyncError);
    });

    it('should wake up itself to execute ready handlers', async function() {    
      // Wake up itself from a Promise.race(pending)

      const history = [];
      const scheduler = new Executor();
      const resolver = Promise.withResolvers();
      scheduler.post(() => resolver.promise);
      const schedulerPromise = scheduler.run();
      scheduler.post(() => history.push(1));
      await sleep(2);
      try {
        strictEqual(history.join(','), '1');
      } finally {
        resolver.resolve();
        await schedulerPromise;
      }
    });

  });

});