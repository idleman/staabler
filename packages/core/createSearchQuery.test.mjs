import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'assert';
import createSearchQuery from './createSearchQuery.mjs';


describe(getPackageName(import.meta.url), function() {

  it('should work as expected ', function() {
    strictEqual(createSearchQuery(null), '');
    strictEqual(createSearchQuery({ abc: 123 }), '?abc=123');
    strictEqual(createSearchQuery({ name: { eq: 123 } }), '?name[eq]=123');
    strictEqual(createSearchQuery({ name: { eq: 123, lgt: 321 } }), '?name[eq]=123&name[lgt]=321');
    strictEqual(createSearchQuery({ name: { eq: { foo: 123 } } }), '?name[eq][foo]=123');
  });


});