import getPackageName from './getPackageName.mjs';
import ObjectPool from './ObjectPool.mjs';
import { strictEqual, notStrictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should allow re-use objects in a simple way', function() {
    const factory = () => new Uint8Array([0, 0]);
    const deleter = obj => obj.forEach(((_, i) => (obj[i] = 0)));

    const pool = new ObjectPool(factory, deleter);

    const first = pool.construct();
    const second = pool.construct();
    strictEqual(first instanceof Uint8Array, true);
    strictEqual(second instanceof Uint8Array, true);
    notStrictEqual(first, second);
    first[0] = 1;
    first[1] = 2;
    pool.destruct(first);
    strictEqual(first[0], 0);
    strictEqual(first[1], 0);
    strictEqual(first, pool.construct());
  });

  describe('#use', function() {

    it('should auto release on return value', function() {
      let counter = 0;
      const pool = new ObjectPool(() => ++counter);
      const cb = value => {
        strictEqual(value, 1);
        return value;
      };
      strictEqual(pool.use(cb), 1);
      strictEqual(pool.use(cb), 1);
    });

    it('should support errors', function() {
      let error;
      let counter = 0;
      let initial = true;
      const pool = new ObjectPool(() => ++counter);
      const cb = value => {
        if(!initial) {
          error = new Error('My error');
          throw error;
        }
        initial = false;
        strictEqual(value, 1);
        return value;
      };
      strictEqual(pool.use(cb), 1);

      try {
        pool.use(cb);
        throw new Error('Unknown error');
      } catch(err) {
        strictEqual(err, error);
      }
    });

  });

});