import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import capitalize from './capitalize.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should make the first letter uppcase', function() {
    strictEqual(capitalize('test'), 'Test');
    strictEqual(capitalize('hello world'), 'Hello world');
  });

});