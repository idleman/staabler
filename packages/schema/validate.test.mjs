import validate from './validate.mjs';
import { strictEqual } from 'node:assert';
import tryCatch from '@staabler/core/tryCatch.mjs';
import getPackageName from '@staabler/core/getPackageName.mjs';

describe(getPackageName(import.meta.url), function() {
  
  const schema = { type: 'string', minLength: 1 };
  
  it('should return the provided value if it statisfy schema, throw otherwise', async function() {
    strictEqual(validate(schema, 'test'), 'test');
    const [_1, error] = tryCatch(() => validate(schema, ''));
    strictEqual(!!_1, false);
    strictEqual(!!error, true);
  });

  it('should be able to provide a defaultValue if validation fail', async function() {
    strictEqual(validate(schema, '', 'My default value'), 'My default value');
  });

});