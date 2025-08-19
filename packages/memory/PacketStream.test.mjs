import getPackageName from '@staabler/core/getPackageName.mjs';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import PacketStream from './PacketStream.mjs';
import { strictEqual, notStrictEqual } from 'node:assert';
import isNullish from '@staabler/core/isNullish.mjs';
import isObjectLiteral from '@staabler/core/isObjectLiteral.mjs';


describe(getPackageName(import.meta.url), function() {

  it('should support basic usage', function() {


    const buffer = new SharedArrayBuffer(64);
    const stream = new PacketStream(buffer);

    const first = new Uint8Array([1, 2]);
    strictEqual(stream.tryWrite(first), true);
    
    const second = new Uint8Array([3, 4, 5]);
    strictEqual(stream.tryWrite(second), true);
    
    
    const got1 = stream.tryRead();
    strictEqual(got1?.join(), first.join());
    
    const got2 = stream.tryRead();
    strictEqual(got2?.join(), second.join());
  });

  it('should work as a ring buffer', function() {
    const buffer = new SharedArrayBuffer(64);
    const stream = new PacketStream(buffer);

    for(let i = 0; i < 1024; ++i) {

      const byteLength = 1 + Math.round(Math.random()*3);
      const expect = new Uint8Array(byteLength);
      for(let index = 0; index < byteLength; ++index) {
        expect[index] = index + 1;
      }

      strictEqual(stream.tryWrite(expect), true);
      const got = stream.tryRead();
      strictEqual(got.byteLength, byteLength);
      strictEqual(got.join(), expect.join());
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
    writerLength = 1
} = {}) {
    const buffer = new SharedArrayBuffer(byteLength);
    const readers = Array.from({ length: readerLength }, () => createWorker('./PacketStream.test.reader.mjs', time, buffer));
    const writers = Array.from({ length: writerLength }, () => createWorker('./PacketStream.test.writer.mjs', time, buffer));
    const workers = writers.concat(readers);
    
    return new Promise((resolve, reject) => {

      let done = false;
      const results = [];
      const setTimeoutId = setTimeout(() => onResult(new Error('Timeout')), Math.round(time*5));

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

  xit('should have decent performance', async function() {
    const time = 5000;
    this.timeout(Math.round(time*2.5));
    const byteLength = 1024**2 * 256;
    const transferred = await createWorkerTest({ time, byteLength });
    const timeInSeconds = time/1000;
    const speed = transferred/timeInSeconds;
    console.log(`transferred(buffer=${byteLength})`, {
      speed,
      transferred,
      Mbs: speed/1024**2
    });
    notStrictEqual(speed, 0);
    notStrictEqual(transferred, 0);
  });  

});