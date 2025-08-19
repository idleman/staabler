import getPackageName from './getPackageName.mjs';
import Callable from './Callable.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('Callable(): should make the first letter uppcase', function() {

    class Foo extends Callable {

      constructor(name = 'John') {
        super();
        this._name = name;
      }

      setName(v) {
        this._name = v;
      }

      operator() {
        return `Hi ${this._name}!`;
      }

    }

    const foo = new Foo();
    strictEqual(foo(), 'Hi John!');
    foo.setName('David');
    strictEqual(foo(), 'Hi David!');
  });

});