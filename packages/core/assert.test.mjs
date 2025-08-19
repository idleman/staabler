import getPackageName from './getPackageName.mjs';
import assert from './assert.mjs';
import { throws } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should throw by default if value is nullish', async function() {
    throws(() => assert(null));
    throws(() => assert(void(0)));
    assert('');
    assert(0);
    assert('hello');
  });

});