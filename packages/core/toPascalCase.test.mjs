import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import toPascalCase from './toPascalCase.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should pascal case a string', function() {
    strictEqual(toPascalCase('user'), 'User');
    strictEqual(toPascalCase('user-action-test'), 'UserActionTest');
    strictEqual(toPascalCase('user_action_test'), 'UserActionTest');
    strictEqual(toPascalCase('user_action_test12'), 'UserActionTest12');
  });

});