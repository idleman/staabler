import getPackageName from './getPackageName.mjs';
import { strictEqual, throws } from 'node:assert';
import tryCatch from './tryCatch.mjs';
import assertAllFulfilled from './assertAllFulfilled.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should throw if some object is not status="fulfilled"', async function() {

    const works = await Promise.allSettled([
      Promise.resolve(123),
      Promise.resolve(321)
    ]);
    const values = assertAllFulfilled(works);
    strictEqual(values.join(','), '123,321');

    const error = await Promise.allSettled([
      Promise.resolve(123),
      Promise.reject(new Error('Bad error!'))
    ]);
    throws(() => assertAllFulfilled(error));
  });

  it('should be possible to overwrite error thrown (object)', async function() {
    const error = await Promise.allSettled([
      Promise.resolve(123),
      Promise.reject(new Error('Bad error!'))
    ]);
    const expected = new Error('My custom error');
    const [_1, got] = tryCatch(() => assertAllFulfilled(error, expected));
    strictEqual(!!_1, false);
    strictEqual(got, expected);
  });

  it('should be possible to overwrite error thrown (constructor)', async function() {
    const error = await Promise.allSettled([
      Promise.resolve(123),
      Promise.reject(new Error('Bad error!'))
    ]);
    class MyError { }

    const [_1, got] = tryCatch(() => assertAllFulfilled(error, MyError));
    strictEqual(!!_1, false);
    strictEqual(got instanceof MyError, true);
  });

});