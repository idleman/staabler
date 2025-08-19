import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import RadixTree from './RadixTree.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should work as expected', function() {
    const tree = new RadixTree('state');

    tree
      .setIn(['users'], 'users')
      .setIn(['users', 'john'], 'john')
      .setIn(['users', 'jane'], 'jane')
      .setIn(['users', 'john', 'posts'], 'john posts')
      .setIn(['users', 'jane', 'posts'], 'jane posts');

    // const js = tree.toJS();
    // console.log(JSON.stringify(js, null, 2));
    strictEqual(tree.getIn(['users', 'john']), 'john');
    strictEqual(tree.getIn(['users', 'john', 'posts']), 'john posts');
    strictEqual(tree.getIn(['users', 'jane', 'posts']), 'jane posts');
    strictEqual(tree.getIn(['users', 'jane', 'posts', 'not-found']), void(0));
    strictEqual(tree.getIn(['users', 'jane', 'posts', 'not-found'], 'default'), 'default');


    // Add custom resolve
    strictEqual(tree.closest(['users', 'adam']), 'users');
    strictEqual(tree.closest(['users', 'john']), 'john');
    strictEqual(tree.closest(['users', 'john', 'posts', '123', 'edit']), 'john posts');
  });

});