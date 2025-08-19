import getPackageName from '@staabler/core/getPackageName.mjs';
import Mutex from './Mutex.mjs';
import { strictEqual } from 'node:assert';



describe(getPackageName(import.meta.url), function() {
  
  describe('#tryLock + unlock', function() {

    it('should return true on success', function() {
      const buffer = new SharedArrayBuffer(4);
      const first = new Mutex(buffer);
      strictEqual(first.isLocked(), false);
      strictEqual(first.tryLock(), true);
      strictEqual(first.isLocked(), true);
      
      const second = new Mutex(buffer);
      strictEqual(second.isLocked(), true);
      strictEqual(second.tryLock(), false);
      strictEqual(second.isLocked(), true);

      first.unlock();
      strictEqual(first.isLocked(), false);
      strictEqual(second.tryLock(), true);
      strictEqual(second.isLocked(), true);
    });

  });

});