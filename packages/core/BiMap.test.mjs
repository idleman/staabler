import getPackageName from './getPackageName.mjs';
import BiMap from './BiMap.mjs';
import { strictEqual } from 'assert';


describe(getPackageName(import.meta.url), function() {

  it('should work', function() {

    const map = new BiMap();
    strictEqual(map.size, 0);
    map.set(0, 'a');
    strictEqual(map.size, 1);
    map.set(1, 'b');
    strictEqual(map.size, 2);
    strictEqual(map.inverse.size, 2);

    strictEqual(map.get(0), 'a');
    strictEqual(map.get(1), 'b');
    strictEqual(map.inverse.get('a'), 0);
    strictEqual(map.inverse.get('b'), 1);
    
    map.inverse.delete('a');
    strictEqual(map.size, 1);
    strictEqual(map.inverse.size, 1);
    strictEqual(map.get(1), 'b');
    strictEqual(map.get(0), void(0));
    strictEqual(map.inverse.get('b'), 1);

  });


});