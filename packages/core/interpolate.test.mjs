import getPackageName from './getPackageName.mjs';
import interpolate from './interpolate.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {
  it('should interpolate string with the given param', () => {
    const str = 'Hello {{name}}';
    const params = { name: 'World' };

    strictEqual(interpolate(str, params), 'Hello World');
  });

  it('should be able to interpolate string with several params', () => {
    const str = '{{greeting}} {{name}}';
    const params = { greeting: 'Hello', name: 'World' };

    strictEqual(interpolate(str, params), 'Hello World');
  });

  it('should do nothing if no params are given', () => {
    const str = 'Hello World';
    const params = {};

    strictEqual(interpolate(str, params), str);
  });
});