import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import toCamelCase from './toCamelCase.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should pascal case a string', function() {
    strictEqual(toCamelCase('user'), 'user');
    strictEqual(toCamelCase('user-action-test'), 'userActionTest');
    strictEqual(toCamelCase('user-action-test12'), 'userActionTest12');
  });

});