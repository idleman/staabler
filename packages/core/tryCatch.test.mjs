import getPackageName from './getPackageName.mjs';
import tryCatch from './tryCatch.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  const Throw = (err = new Error('test')) => {
    throw err;
  };

  it('should return handler return value if OK', function() {
    const [first] = tryCatch(() => 'hello');
    const [second] = tryCatch(() => 'hello', 123);
    strictEqual(first, 'hello');
    strictEqual(second, 'hello');
  });

  it('should return defaultValue in case of a synchormous error', function() {
    const [result, error] = tryCatch(Throw.bind(null, 'MyError'), 123);
    strictEqual(result, 123);
    strictEqual(error, 'MyError');
  });

  it('should return the resolved value if a promise is returned on success', async function() {
    const [result, error] = await tryCatch(() => Promise.resolve('hello'), 123);
    strictEqual(result, 'hello');
    strictEqual(error, void(0));
  });

  it('should return defaultValue if the promise is rejected', async function() {
    const [result, error] = await tryCatch(() => Promise.reject('AsyncError'), 123);
    strictEqual(result, 123);
    strictEqual(error, 'AsyncError');
  });

});