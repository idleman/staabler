import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'assert';
import createSignal from './createSignal.mjs';


describe(getPackageName(import.meta.url), function() {

  it('should create a [getter,setter]', function() {
    const [getState, setState] = createSignal(0);
    strictEqual(getState(), 0);
    strictEqual(setState(123), 123);
    strictEqual(getState(), 123);
  });


});