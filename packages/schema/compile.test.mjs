import compile from './compile.mjs';
import { strictEqual } from 'node:assert';
import getPackageName from '@staabler/core/getPackageName.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should support basic usage', async function() {
    const schema = { type: 'string', minLength: 1 };
    const validator = compile(schema);
    strictEqual(typeof validator, 'function');
    strictEqual(validator(''), false);
    strictEqual(validator('test'), true);
  });

});