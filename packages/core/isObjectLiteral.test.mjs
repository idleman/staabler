import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import isObjectLiteral from './isObjectLiteral.mjs';


describe(getPackageName(import.meta.url), function() {

  it('should return true of object literals and false for everything else ', function() {
    const valid = [{}, { foo: 123 } ];
    valid.forEach(val => strictEqual(isObjectLiteral(val), true));

    const invalid = [1, null, ['I am an array'] ];
    invalid.forEach(val => strictEqual(isObjectLiteral(val), false));
  });


  it('should support Object.create(null)', function() {
    const obj = Object.create(null);
    strictEqual(isObjectLiteral(obj), true);
  });

});