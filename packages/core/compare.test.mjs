import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'assert';
import compare from './compare.mjs';


describe(getPackageName(import.meta.url), function() {

  it('should support numbers', function() {
    strictEqual(compare(0, 0), 0);
    strictEqual(compare(0, 1), -1);
    strictEqual(compare(1, 0), 1);
  });

  it('should support strings', function() {
    strictEqual(compare('a', 'a'), 0);
    strictEqual(compare('a', 'b'), -1);
    strictEqual(compare('c', 'a'), 1);
  });

  it('should support booleans', function() {
    strictEqual(compare(true, true), 0);
    strictEqual(compare(false, true), -1);
    strictEqual(compare(true, false), 1);
  });


  it('should support objects', function() {
    strictEqual(compare({ age: 30, name: 'John' }, { age: 30, name: 'John' }), 0);
    strictEqual(compare({ age: 25, name: 'James' }, { age: 30, name: 'John' }), -1); // age come first
    strictEqual(compare({ age: 35, name: 'James' }, { age: 30, name: 'John' }), 1);
  });

  it('should support arrays', function() {
    strictEqual(compare([0,0], [0, 0]), 0);
    strictEqual(compare([0,0], [0, 1]), -1);
    strictEqual(compare([0,1], [0, 0]), 1);
  });

});