import getPackageName from '@staabler/core/getPackageName.mjs';
import Stream from './Stream.mjs';
import LRUMap from '@staabler/core/LRUMap.mjs';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import Timer from '@staabler/core/Timer.mjs';
import isNullish from '@staabler/core/isNullish.mjs';
import { strictEqual, notStrictEqual } from 'node:assert';
import isObjectLiteral from '@staabler/core/isObjectLiteral.mjs';

describe(getPackageName(import.meta.url), function() {


  it('should support basic usage', function() {
    const buffer = new ArrayBuffer(12 + 4);
    const stream = new Stream(buffer);

    strictEqual(stream.size(), 0);
    strictEqual(stream.capacity(), 3);

    strictEqual(stream.write(new Uint8Array([1, 2])), 2);
    strictEqual(stream.peek(), 1);
    strictEqual(stream.size(), 2);
    strictEqual(stream.peek(1), 2);
    strictEqual(stream.capacity(), 1);
    strictEqual(stream.write(new Uint8Array([3])), 1);
    strictEqual(stream.size(), 3);
    strictEqual(stream.capacity(), 0);

    const first = new Uint8Array(1);
    strictEqual(stream.read(first), 1);
    strictEqual(first[0], 1);
    const second = new Uint8Array(2);
    strictEqual(stream.read(second), 2);
    strictEqual(second.join(','), '2,3');
  });

  it('should detect when it is full and return false', function() {
    const buffer = new ArrayBuffer(12 + 4);
    const stream = new Stream(buffer);

    strictEqual(stream.size(), 0);
    strictEqual(stream.capacity(), 3);
    strictEqual(stream.write(new Uint8Array([1, 2])), 2);

    strictEqual(stream.size(), 2);
    strictEqual(stream.capacity(), 1);
    strictEqual(stream.read(new Uint8Array(2)), 2);

    strictEqual(stream.size(), 0);
    strictEqual(stream.capacity(), 3);
    strictEqual(stream.write(new Uint8Array([3, 4, 5])), 3);

    strictEqual(stream.size(), 3);
    strictEqual(stream.capacity(), 0);
    strictEqual(stream.write(new Uint8Array([6])), 0);

    const data = new Uint8Array(3);
    strictEqual(stream.read(data), 3);
    strictEqual(data.join(''), '345');
    
  });
  
  it('should work to use as a queue', function() {
    const buffer = new ArrayBuffer(36);
    const stream = new Stream(buffer);

    
    const randomInt = (max = 2) => Math.floor(Math.random()*max);
    
    let outbound = [];
    let transferred = 0;
    let byteLength = 0;
    
    while(transferred < 10000) {
      
      const writeLength = randomInt(11);
      const writeValues = new Uint8Array(writeLength);
      for(let i = 0; i < writeLength; ++i) {
        writeValues[i] = 1 + randomInt(2**7);
      }
      const writeResult = stream.write(writeValues);
      
      if(writeResult) {
        strictEqual(writeResult, writeLength);
        outbound.push(...writeValues);
        byteLength += writeResult;
      }
      

      const readLength = Math.min(byteLength, randomInt(11));
      const readed = new Uint8Array(readLength);
      readed.fill(0);
      
      strictEqual(stream.read(readed), readLength);
      for(let i = 0; i < readLength; ++i) {
        const expect = outbound.shift();
        strictEqual(readed[i], expect, `got=${readed[i]}, expect=${expect}, byteLength=${byteLength}, transferred=${transferred}, i=${i}`);
      }
      transferred += readLength;
      byteLength -= readLength;
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
    const readers = Array.from({ length: readerLength }, () => createWorker('./Stream.test.reader.mjs', time, buffer, validate));
    const writers = Array.from({ length: writerLength }, () => createWorker('./Stream.test.writer.mjs', time, buffer, validate));
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
    const transferred = await createWorkerTest({ time, byteLength, validate: true });
    const timeInSeconds = time/1000;
    const transferredInMB = transferred/(1024**2);
    const speedInMbs = transferredInMB/timeInSeconds;
    // console.log(`transferred(buffer=${byteLength})`, {
    //   transferred,
    //   transferredInMB: `${transferredInMB} Mb`,
    //   speed: `${speedInMbs} Mbs`
    // });
    notStrictEqual(transferred, 0);
    strictEqual(10 < speedInMbs, true);
  });

  
  class Allocator {

    constructor() {
      this.cache = new LRUMap(2**10);
    }

    getUint8Array(length = 0) {
      const cache = this.cache;
      const maybe = cache.get(length);
      if(maybe !== void(0)) {
        return maybe;
      }

      const array = new Uint8Array(length);
      if(length < 1024**2) {
        cache.set(length, array);
      }
      return array;
    }

  }

  xit('should have decent single thread performance', async function() {
    const time = 5000;
    this.timeout(Math.round(time*2.5));
    const timer = new Timer();

    let transferred = 0;
    const allocator = new Allocator();
    const stream = new Stream(new SharedArrayBuffer(1024**2));
    while(timer.elapsed() < time) {
      const byteLength = Math.random() * 2**16;
      const array = allocator.getUint8Array(byteLength);
      array.fill(Math.round(Math.random() * 255));
      for(let i = 0; i < 128; ++i) {
        if(stream.write(array)) {
          stream.read(array);
          transferred += byteLength;
        }
      }
    }
    
    const timeInSeconds = time/1000;
    const transferredInMB = transferred/(1024**2);
    const speedInMbs = transferredInMB/timeInSeconds;
    console.log(`performance`, {
      transferred,
      transferredInMB: `${transferredInMB} Mb`,
      speed: `${speedInMbs} Mbs`
    });
    notStrictEqual(transferred, 0);
    strictEqual(10 < speedInMbs, true);
  });

  xit('should have decent performance', async function() {
    const time = 5_000;
    this.timeout(Math.round(time*2.5));
    const byteLength = 2**24;
    const transferred = await createWorkerTest({ time, byteLength, writerLength:2, readerLength: 4, validate: false });
    const timeInSeconds = time/1000;
    const transferredInMB = transferred/(1024**2);
    const speedInMbs = transferredInMB/timeInSeconds;
    console.log(`transferred(buffer=${byteLength})`, {
      transferred,
      transferredInMB: `${transferredInMB} Mb`,
      speed: `${speedInMbs} Mbs`
    });
    notStrictEqual(transferred, 0);
    strictEqual(250 < speedInMbs, true);
  });

  

});