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

    index.delete(jane);
    
    strictEqual(index.size, 0);
    strictEqual(index.has(jane), false);
    strictEqual(index.get('id', 1), void(0));
    strictEqual(index.get('age', 10), void(0));
    strictEqual(index.get('name', 'Jane'), void(0));

  });

});