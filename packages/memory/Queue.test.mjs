import Queue from './Queue.mjs';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import isNullish from '@staabler/core/isNullish.mjs';
import { strictEqual, notStrictEqual } from 'node:assert';
import getPackageName from '@staabler/core/getPackageName.mjs';
import isObjectLiteral from '@staabler/core/isObjectLiteral.mjs';
//import readerTest from './LockFreeQueue.test.reader.mjs';

describe(getPackageName(import.meta.url), function() {

  it('should support basic usage', function() {
    const buffer = new ArrayBuffer(1024);
    const queue = new Queue(buffer);
    strictEqual(queue.size(), 0);
    strictEqual(queue.push(10), 10);
    strictEqual(queue.size(), 1);
    
    strictEqual(queue.push(20), 20);
    strictEqual(queue.size(), 2);

    strictEqual(queue.shift(), 10);
    strictEqual(queue.size(), 1);
    strictEqual(queue.isEmpty(), false);
    strictEqual(queue.shift(), 20);
    strictEqual(queue.size(), 0);
    strictEqual(queue.isEmpty(), true);
  });

  it('should detect when it is full and return false (Uint32Array)', function() {
    const buffer = new ArrayBuffer(1024); // can contain 2 values (1 empty slot always)
    const queue = new Queue(buffer);
    strictEqual(queue.size(), 0);
    strictEqual(queue.push(10),  10);
    strictEqual(queue.size(), 1);

    strictEqual(queue.push(11), 11);
    strictEqual(queue.size(), 2);
    
    for(let i = 0, len = 10; i < len; ++i) {
      strictEqual(queue.shift(), i + 10);
      strictEqual(queue.size(), 1);
      strictEqual(queue.push(12 + i), 12 + i);
    }
    
  });

  function createWorker(path, ...args) {
    const worker = new Worker(fileURLToPath(import.meta.resolve(path)));
    worker.postMessage(args);
    return worker;
  }

  function createWorkerTest({
    time = 100,
    byteLength = 0,
    readerLength = 1,
    writerLength = 1,
    validate = false
} = {}) {
    const buffer = new SharedArrayBuffer(byteLength);
    const readers = Array.from({ length: readerLength }, () => createWorker('./Queue.test.reader.mjs', time, buffer, validate));
    const writers = Array.from({ length: writerLength }, () => createWorker('./Queue.test.writer.mjs', time, buffer, validate));
    const workers = writers.concat(readers);
    
    return new Promise((resolve, reject) => {

      let done = false;
      const results = [];
      const setTimeoutId = setTimeout(() => onResult(new Error('Timeout')), Math.round(time*2.5));

      function onResult(err, val) {
        if(done) {
          return;
        }
        done = true;
        
        setTimeout(() => {
          workers.forEach(worker => {
            try { worker.terminate(); } catch(e) { }
          });
          
          clearTimeout(setTimeoutId);
          return isNullish(err) ? resolve(val) : reject(err);
        }, 0);
      }

      const onMessage = (index, obj) => {
        if(!(isObjectLiteral(obj) && obj.type === 'result')) {
          return;
        }
        if(index !== 0) {
          // ignore writer
          results.push(obj.value);
        }
        // console.log({ index, ...obj });
        if(results.length !== readers.length) {
          return;
        }
        
        const sum = results.reduce((s, v) => s + v, 0);
        const result = Math.round(sum/results.length);
        return onResult(null, result);
      };
      workers.forEach((worker, index) => {
        worker.on('message', onMessage.bind(null, index));
        worker.on('error', err => onResult(err));
      });
    })
  }

  it('should have work with multiple threads', async function() {
    const time = 100;
    this.timeout(Math.round(time*2.5));
    const byteLength = 2**24;
    const operations = await createWorkerTest({ time, byteLength, validate: true });
    const timeInSeconds = time/1000;
    const ops = operations/timeInSeconds;
    // console.log({
    //   ops,
    //   time,
    //   operations
    // });
    notStrictEqual(ops, 0);
    strictEqual(100_000 < ops, true);
  });

  xit('should have decent performance', async function() {
    const time = 5000;
    this.timeout(Math.round(time*2.5));
    const byteLength = 2**24;
    const operations = await createWorkerTest({ time, byteLength, validate: false });
    const timeInSeconds = time/1000;
    const ops = operations/timeInSeconds;
    console.log({
      ops,
      time,
      operations
    });
    notStrictEqual(ops, 0);
    strictEqual(1_000_000 < ops, true);
  });

});