import Queue from './Queue.mjs';
import { strictEqual } from 'node:assert';
import getPackageName from './getPackageName.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should work as expected', function() {
    const queue = new Queue();

    strictEqual(queue.length, 0);
    strictEqual(queue.back(), void(0));
    strictEqual(queue.front(), void(0));
    queue.push(1);
    strictEqual(queue.back(), 1);
    strictEqual(queue.front(), 1);
    strictEqual(queue.length, 1);
    queue.push(2);
    strictEqual(queue.back(), 2);
    strictEqual(queue.front(), 1);
    strictEqual(queue.length, 2);
    strictEqual(queue.shift(), 1);
    strictEqual(queue.length, 1);
    strictEqual(queue.shift(), 2);
    strictEqual(queue.length, 0);
    strictEqual(queue.shift(), void(0));
    strictEqual(queue.length, 0);
  });

  it('should be able to grow dynamically', function() {
    const queue = new Queue();

    strictEqual(queue.length, 0);
    const length = 2**10;
    for(let i = 1; i <= length; ++i) {
      queue.push(i);
      strictEqual(queue.length, i);
    }
    
    strictEqual(queue.length, length);

    for(let i = 1; i <= length; ++i) {
      strictEqual(queue.shift(), i);
      strictEqual(queue.length, length - i);
    }
    strictEqual(queue.length, 0);
    strictEqual(queue.shift(), void(0));
    strictEqual(queue.length, 0);
  });

  xit('should have decent performance', function() {
    const length = 2**16;
    
    const handlers = [
      ['fill', function fill(queue) {
        for(let i = 0; i < length; ++i) {
          queue.push(i);
        }
        return length;
      }],
      ['drain', function drain(queue) {
        const count = queue.length;
        for(let i = 0; i < count; ++i) {
          queue.shift();
        }
        return count;
      }]
    ]

    const objects = [
      ['Native array', []],
      ['Queue', new Queue()]
    ];
    for(const [type, queue] of objects) {
      for(const [name, test] of handlers) {
        const now = performance.now();
        const count = test(queue);
        const elapsed = performance.now() - now;
        
        //const ops = count/elapsedInSeconds;1
        
        console.log(`${type} ${name}`.padEnd(26, ' '), `${elapsed} ms`);
      }
    }
    
  });
  

});