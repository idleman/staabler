import getPackageName from './getPackageName.mjs';
import getIn from './getIn.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should support arrays', function() {
    const data = [
      1,
      [2],
      [3, [4,5,6]]
    ];
    strictEqual(getIn(data, [5]), void(0));
    strictEqual(getIn(data, [0]), 1);
    strictEqual(getIn(data, [1, 0]), 2);
    strictEqual(getIn(data, [2, 1,2]), 6);
    strictEqual(getIn(data, [1, 1]), void(0));
  });


  it('should support maps', function() {
    const data = new Map([
      ['john', new Map([
        ['age', 35],
        ['name', 'John Doe']
      ])]
    ]);
    strictEqual(getIn(data, ['john', 'age']), 35);
    strictEqual(getIn(data, ['john', 'name']), 'John Doe');
    strictEqual(getIn(data, ['john', 'street']), void(0));

    strictEqual(getIn(data, ['john', 'name', 'at', 0]), 'J');
  });


  it('should support object literals', function() {
    const data = {
      john: {
        age: 35,
        name: 'John Doe'
      }
    };
    strictEqual(getIn(data, ['john', 'age']), 35);
    strictEqual(getIn(data, ['john', 'name']), 'John Doe');
    strictEqual(getIn(data, ['john', 'street']), void(0));

    strictEqual(getIn(data, ['john', 'name', 'at', 0]), 'J');
  });


});