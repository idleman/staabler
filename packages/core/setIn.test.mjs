import getPackageName from './getPackageName.mjs';
import getIn from './getIn.mjs';
import setIn from './setIn.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should support maps', function() {
    const data = new Map([
      ['john', new Map([
        ['age', 35],
        ['name', 'John Doe']
      ])],
      ['value', 123]
    ]);
    strictEqual(getIn(data, ['john', 'age']), 35);
    setIn(data, ['john', 'age'], 50);
    strictEqual(getIn(data, ['john', 'age']), 50);
  });


  it('should support object literals', function() {
    const data = {
      john: {
        age: 35,
        name: 'John Doe'
      },
      value: 123
    };
    strictEqual(getIn(data, ['john', 'age']), 35);
    setIn(data, ['john', 'age'], 50);

    strictEqual(getIn(data, ['value']), 123);
    setIn(data, ['value'], 321);
    strictEqual(getIn(data, ['value']), 321);
  });

});