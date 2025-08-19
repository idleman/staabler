import { strictEqual } from 'node:assert';
import getPackageName from './getPackageName.mjs';

describe('getPackageName', function() {

  it('should work as expected', function() {
    strictEqual(getPackageName(import.meta.url), 'core/getPackageName');
  });

});