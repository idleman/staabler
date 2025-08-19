import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import hasOwnProperty from './hasOwnProperty.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should return true if the object has the property', () => {
    const params = { name: 'World' };
    strictEqual(hasOwnProperty(params, 'name'), true);
    strictEqual(hasOwnProperty(params, 'hasOwnProperty'), false);
  });

});