import getPackageName from './getPackageName.mjs';
import autobind from './autobind.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should bind a set of methods to the object', function() {

    const john = {
      name: 'John',
      sayHello() {
        return `Hi ${this.name}!`;
      }
    };

    strictEqual(john.sayHello(), 'Hi John!');
    strictEqual(john.sayHello.call({ name: 'Jane' }), 'Hi Jane!');


    autobind(john, 'sayHello');
    strictEqual(john.sayHello.call({ name: 'Jane' }), 'Hi John!');
  });

  it('should auto-detect members if used within a class-constructor', function() {

    class Person {

      constructor(name) {
        autobind(this);
        this.name = name;
      }

      sayHello() {
        return `Hi ${this.name}!`;
      }

    }

    const john = new Person('John');
    strictEqual(john.sayHello(), 'Hi John!');
    const jane = new Person('Jane');
    strictEqual(jane.sayHello(), 'Hi Jane!');

    strictEqual(john.sayHello.call(jane), 'Hi John!');

  });

});