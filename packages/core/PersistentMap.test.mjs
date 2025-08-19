import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import PersistentMap from './PersistentMap.mjs';


describe(getPackageName(import.meta.url), function() {

  describe('#constructor', function() {

    it('should be constructible', function() {
      const obj = new PersistentMap();
      strictEqual(obj instanceof PersistentMap, true);
    });

  });

  describe('#set+get+has+delete', function() {

    it('should work as expected', async function() {
      const obj = new PersistentMap();
      const values = [123, {}, () => 123];

      values.forEach(val => {
        strictEqual(obj.has(val), false);
        strictEqual(obj.set(val, 'Sarah'), obj);
        strictEqual(obj.get(val), 'Sarah');
        strictEqual(obj.delete(val), obj);
        strictEqual(obj.has(val), false);
        strictEqual(obj.get(val), void(0));
      });

    });

    it('should be able to provide a custom map for none weak keys', async function() {
      const map = new Map();
      const obj = new PersistentMap([], map);

      strictEqual(obj.has(123), false);
      map.set(123, 321);
      strictEqual(obj.has(123), true);
      strictEqual(obj.get(123), 321);
      obj.delete(123);
      strictEqual(map.has(123), false);
    });

  });




});