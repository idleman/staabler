import compare from './compare.mjs';
import OrderedArray from './OrderedArray.mjs';
import { strictEqual } from 'node:assert/strict';
import getPackageName from './getPackageName.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should support basic usage', function() {
    const numbers = new OrderedArray();
    numbers.push(50);
    numbers.push(30);
    numbers.push(30);
    numbers.push(10);
    numbers.push(40);
    strictEqual(numbers.includes(30), true);
    strictEqual(numbers.includes(20), false);
    strictEqual(Array.from(numbers).join(', '), '10, 30, 30, 40, 50');
    
    strictEqual(numbers.lower(id => compare(id, 30)), 1);
    strictEqual(numbers.upper(id => compare(id, 30)), 2);
    const [ lower, upper ] = numbers.range(id => compare(id, 30));
    const length = upper - lower + 1;
    for(let i = 0; i < length; ++i) {
      strictEqual(numbers.at(lower + i), 30);
    }
    strictEqual(length, 2);
  });

  it('should support complex objects', function() {
    const numbers = new OrderedArray();
    numbers.push({ id: 50, value: 1 });
    numbers.push({ id: 30, value: 2 });
    numbers.push({ id: 30, value: 3 });
    numbers.push({ id: 10, value: 4 });
    numbers.push({ id: 40, value: 5 });
    strictEqual(Array.from(numbers).map(v => v.id).join(', '), '10, 30, 30, 40, 50');
    strictEqual(numbers.lower(obj => compare(obj.id, 30)), 1);
    strictEqual(numbers.upper(obj => compare(obj.id, 30)), 2);
    const [ lower, upper ] = numbers.range(obj => compare(obj.id, 30));
    const length = upper - lower + 1;
    for(let i = 0; i < length; ++i) {
      strictEqual(numbers.at(lower + i).id, 30);
    }
    strictEqual(length, 2);
  });

});