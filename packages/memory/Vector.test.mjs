import getPackageName from '@staabler/core/getPackageName.mjs';
import Vector from './Vector.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {  

  const types = [
    ['Int8', -100, 1],
    ['Uint8', 200, 1],
    ['Int16', -14_000, 2],
    ['Uint16', 30_000, 2],
    ['Int32', -2_000_000_000, 4],
    ['Uint32', 4_000_000_000, 4],
    ['BigInt64', - (2n**62n), 8, BigInt],
    ['BigUint64', 2n**64n - 1n, 8, BigInt],

    ['Float32', 2.5, 4],
    ['Float64', Math.PI, 8]
  ];

  for(const [type, value, byteLength, Type = Number] of types) {

    describe(`#set${type} + get${type}`, function() {
  
      it(`should be able to set and get ${type} values`, function() {
        const vector = new Vector();
        vector.resize(byteLength);
        strictEqual(vector[`get${type}`](0), Type(0));
        strictEqual(vector[`set${type}`](0, value), value);
        strictEqual(vector[`get${type}`](0), value);
      });

      it(`should be able push and shift ${type} values`, function() {
        const vector = new Vector();
        strictEqual(vector[`push${type}`](value), value);
        strictEqual(vector[`shift${type}`](), value);

        const half = value/Type(2);
        // console.log('half', half);
        strictEqual(vector[`push${type}`](half), half);
        strictEqual(vector[`shift${type}`](), half);
      });
  
    });

  }

});