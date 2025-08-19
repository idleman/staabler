import { strictEqual } from 'assert';
import getTemporaryDirectory from './getTemporaryDirectory.mjs';

describe('getTemporaryDirectory', function() {

  it('should support basic usage', function() {
    const dir = getTemporaryDirectory();
    strictEqual(dir.includes('/'), true);
    strictEqual(dir.includes('tmp'), true);
  });

});