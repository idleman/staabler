import getPackageName from './getPackageName.mjs';
import flyweight from './flyweight.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  const createPerson = (age = 0, name = 'John Doe') => ({ age, name });
  
  it('should return a live reference if possible', function() {

    const john = flyweight(createPerson(10, 'John'));
    strictEqual(john.age, 10)
    strictEqual(john.name, 'John');

    const copy = flyweight(createPerson(10, 'John'));
    strictEqual(copy, john);
    
  });

});