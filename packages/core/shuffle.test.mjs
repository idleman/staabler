import getPackageName from './getPackageName.mjs';
import shuffle from './shuffle.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should shuffle an array', function() {
    const array = Array
      .from({ length: 1000 }, (_1, index) => index);
    
    const isOrdered = (value, index) => value === index;
    strictEqual(array.every(isOrdered), true);
    shuffle(array);
    strictEqual(array.every(isOrdered), false);      
  });


});