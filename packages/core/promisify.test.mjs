import getPackageName from './getPackageName.mjs';
import tryCatch from './tryCatch.mjs';
import promisify from './promisify.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should work on successful completion', async function() {
    const sayHello = promisify((name, cb) => cb(null, `Hello ${name}!`));
    strictEqual(await sayHello('John'), 'Hello John!');
  });

  it('should reject the promise on unsuccessful completion', async function() {
    const myError = new Error('Some error');
    const sayHello = promisify((name, cb) => cb(myError, `Hello ${name}!`));

    const [_1, error] = await tryCatch(() => sayHello('John'));
    strictEqual(!!_1, false);
    strictEqual(error, myError);
  });

});