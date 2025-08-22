import getPackageName from './getPackageName.mjs';
import MultiIndex from './MultiIndex.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  const Person = (id = 0, age = 0, name = '') => ({ id, age, name });
  
  const getPersonKeys = ({ id, name }) => ([ ['id', id], ['name', name] ]);

  it('should work', function() {
    const index = new MultiIndex(getPersonKeys);
    strictEqual(index.size, 0);
    const jane = Person(1, 10, 'Jane');
   
    
    strictEqual(index.has(jane), false);
    strictEqual(index.add(jane), index);
    strictEqual(index.has(jane), true);
    strictEqual(index.size, 1);
  
    strictEqual(index.get('id', 1), jane);
    strictEqual(index.get('age', 10), void(0));
    strictEqual(index.get('name', 'Jane'), jane);

    {
      const result = Array.from(index);
      strictEqual(result.length, 1);
      strictEqual(result.includes(jane), true);
    }
    index.delete(jane);
    
    strictEqual(index.size, 0);
    strictEqual(index.has(jane), false);
    strictEqual(index.get('id', 1), void(0));
    strictEqual(index.get('age', 10), void(0));
    strictEqual(index.get('name', 'Jane'), void(0));

    strictEqual(Array.from(index).length, 0);    
  });

  it('should support one-many bindings', function() {
    const index = new MultiIndex(node => {
      return [
        ['id', node.id],      // Unique
        ['age', node.age],    // Many
        ['name', node.name]   //
      ]
    });
    strictEqual(index.size, 0);
    const jane = { id: 1, age: 10, name: 'Jane' };
    const john = { id: 2, age: 10, name: 'John' };
    const henry1 = { id: 3, age: 10, name: 'Henry' };
    const henry2 = { id: 4, age: 15, name: 'Henry' };
   
    index.add(jane);
    index.add(john);
    index.add(henry1);
    index.add(henry2);
    
    strictEqual(index.size, 4);
  

    strictEqual(index.get('id', 1), jane);
    strictEqual(index.get('age', 10), jane); // Age behave as getOne
    {
      const ageMatches = index.getAll('age', 10);
      strictEqual(ageMatches.length, 3);
      strictEqual(ageMatches.includes(jane), true);
      strictEqual(ageMatches.includes(john), true);
      strictEqual(ageMatches.includes(henry1), true);
    }

    {
      const nameMatches = index.getAll('name', 'Henry');
      strictEqual(nameMatches.length, 2);
      strictEqual(nameMatches.includes(henry1), true);
      strictEqual(nameMatches.includes(henry2), true);      
    }

    index.delete(henry1);
    {
      const ageMatches = index.getAll('age', 10);
      strictEqual(ageMatches.length, 2);
      strictEqual(ageMatches.includes(jane), true);
      strictEqual(ageMatches.includes(john), true);
      strictEqual(index.size, 3);
    }
    {
      const nameMatches = index.getAll('name', 'Henry');
      strictEqual(nameMatches.length, 1);
      strictEqual(nameMatches.includes(henry2), true);      
    }
    index.delete(henry2)
    {
      const nameMatches = index.getAll('name', 'Henry');
      strictEqual(nameMatches.length, 0);
      strictEqual(index.size, 2);
    }
  });

});