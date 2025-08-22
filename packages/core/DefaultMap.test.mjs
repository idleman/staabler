import DefaultMap from './DefaultMap.mjs';
import { strictEqual } from 'node:assert';
import getPackageName from './getPackageName.mjs';

describe(getPackageName(import.meta.url), function() {

  describe('#set+get', function() {

    it('should be able to get and set values', function() {
      const map = new DefaultMap(() => 0);
      strictEqual(map.size, 0);
      strictEqual(map.set('a', 1), map);
      strictEqual(map.size, 1);
      strictEqual(map.set('b', 2), map);
      strictEqual(map.size, 2);
      strictEqual(map.get('a'), 1);
      strictEqual(map.get('b'), 2);
      strictEqual(map.size, 2);
      strictEqual(map.get('c'), 0); // Default value
      strictEqual(map.getMaybe('d'), void(0));
      strictEqual(map.getMaybe('d', 123), 123);
    });

  });

});