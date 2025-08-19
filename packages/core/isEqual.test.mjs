import getPackageName from './getPackageName.mjs';
import isEqual from './isEqual.mjs';
import { strictEqual } from 'node:assert';


describe(getPackageName(import.meta.url), function() {

  it('should return true for equal numbers', function() {
    strictEqual(isEqual(1, 1), true);
  });

  it('should return false for different numbers', function() {
    strictEqual(isEqual(1, 2), false);
  });

  it('should return true for equal strings', function() {
    strictEqual(isEqual('hello', 'hello'), true);
  });

  it('should return false for different strings', function() {
    strictEqual(isEqual('hello', 'world'), false);
  });

  it('should return true for equal arrays', function() {
    strictEqual(isEqual([1, 2, 3], [1, 2, 3]), true);
  });

  it('should return false for arrays of different length', function() {
    strictEqual(isEqual([1, 2, 3], [1, 2, 3, 4]), false);
  });

  it('should return false for arrays with same length but different content', function() {
    strictEqual(isEqual([1, 2, 3], [1, 2, 4]), false);
  });

  it('should return true for equal objects', function() {
    strictEqual(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 }), true);
  });

  it('should return false for objects with different keys', function() {
    strictEqual(isEqual({ a: 1, b: 2 }, { a: 1, c: 2 }), false);
  });

  it('should return false for objects with same keys but different values', function() {
    strictEqual(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 }), false);
  });

  it('should handle null values correctly', function() {
    strictEqual(isEqual(null, null), true);
    strictEqual(isEqual(null, void(0)), false);
    strictEqual(isEqual(null, {}), false);
  });

  it('should return true for deeply equal objects', function() {
    const objA = { a: 1, b: { c: 2, d: [3, 4] }};
    const objB = { a: 1, b: { c: 2, d: [3, 4] }};
    strictEqual(isEqual(objA, objB), true);
  });

  it('should return false for deeply unequal objects', function() {
    const objA = { a: 1, b: { c: 2, d: [3, 4] }};
    const objB = { a: 1, b: { c: 2, d: [4, 3] }};
    strictEqual(isEqual(objA, objB), false);
  });

  // Add more tests as necessary for other data types and edge cases
});