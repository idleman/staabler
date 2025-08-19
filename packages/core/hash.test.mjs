import getPackageName from './getPackageName.mjs';
import hash from './hash.mjs';
import { strictEqual, notStrictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {

  it('should support bool', () => {
    strictEqual(hash(true), hash(true));
    notStrictEqual(hash(true), hash(false));
    strictEqual(Number.isSafeInteger(hash(true)), true);
  });

  it('should support integers', () => {
    strictEqual(hash(123), hash(123));
    notStrictEqual(hash(123), hash(321));
    strictEqual(Number.isSafeInteger(hash(123)), true);


    strictEqual(Number.isSafeInteger(hash(0.23)), true);
    strictEqual(Number.isSafeInteger(hash(1/'hi')), true);
    strictEqual(Number.isSafeInteger(hash(Infinity)), true);
    strictEqual(Number.isSafeInteger(hash(-Infinity)), true);
  });

  it('should support strings', () => {
    strictEqual(hash(''), 0);
    strictEqual(hash('hihi'), hash('hihi'));
    notStrictEqual(hash('haha'), hash('hihi'));
  });

  it('should support symbols', () => {
    const foo = Symbol();
    const bar = Symbol();
    strictEqual(hash(foo), hash(foo));
    notStrictEqual(hash(foo), hash(bar));
    strictEqual(Number.isSafeInteger(hash(foo)), true);
  });

  it('should support functions', () => {
    const foo = () => 'foo';
    const bar = () => 'bar';
    strictEqual(hash(foo), hash(foo));
    notStrictEqual(hash(foo), hash(bar));
    strictEqual(Number.isSafeInteger(hash(foo)), true);
  });

  it('should support bigints', () => {
    const foo = BigInt(123);
    const bar = BigInt(foo**32n);
    strictEqual(hash(foo), hash(foo));
    notStrictEqual(hash(foo), hash(bar));
    notStrictEqual(hash(bar), hash(-bar));
    strictEqual(Number.isSafeInteger(hash(foo)), true);
  });

  it('should support nullish', () => {
    const foo = null;
    const bar = void(0);
    strictEqual(hash(foo), hash(foo));
    notStrictEqual(hash(foo), hash(bar));
    strictEqual(Number.isSafeInteger(hash(bar)), true);
    strictEqual(Number.isSafeInteger(hash(foo)), true);
  });

  it('should support Arrays', () => {
    const foo = [123];
    const bar = [321];
    strictEqual(hash(foo), hash(foo));
    notStrictEqual(hash(foo), hash(bar));
    strictEqual(Number.isSafeInteger(hash(bar)), true);
    strictEqual(Number.isSafeInteger(hash(foo)), true);
  });

  it('should support object literals', () => {
    const make = val => ({ a: { val } });
    const foo = make(123);
    const bar = make(321);
    strictEqual(hash({}), 0);
    strictEqual(hash(foo), hash(foo));
    strictEqual(hash(foo), hash(make(123)));
    notStrictEqual(hash(foo), hash(bar));
    strictEqual(Number.isSafeInteger(hash(bar)), true);
    strictEqual(Number.isSafeInteger(hash(foo)), true);
  });

});