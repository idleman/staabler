import Queue from './Queue.mjs';
import noop from '@staabler/core/noop.mjs';
import Timer from '@staabler/core/Timer.mjs';
import isNullish from '@staabler/core/isNullish.mjs';
import { threadId, parentPort, receiveMessageOnPort  } from 'node:worker_threads';

export const kMaxByteLength = 2**16;

export function* createIterator() {
  let id = 0;
  while(true) {
    id = (++id)%254;
    if(id === 0) {
      ++id;  
    }
    yield id;
  }
}


export function verify(got, iterator) {
  const expect = iterator.next().value;
  if(got !== expect) {
    throw new Error(`${threadId}: Validation failed (got=${got}, expect=${expect})`);
  }
}


export function produce(iterator) {
  return iterator.next().value;
}


export function createWriterImplementation(cb = noop) {
  let counter = 0;
  return async function(time, buffer, validate = false) {
    let transferred = 0;
    const timer = new Timer();
    const queue = new Queue(buffer);
    const iterator = createIterator();
    let iterate = true;
    let lastValue = 1;
    while(timer.elapsed() < time) {
      for(let i = 0; i < 100; ++i) {
        if(validate && iterate) {
          lastValue = iterator.next().value;
          iterate = false;
        }
        const success = cb(queue, lastValue);
        if(success) {
          ++counter;
          iterate = true;
          transferred += 1;
        }
      }
    }
    return transferred;
  }
}


export function createReaderImplementation(cb = noop) {
  let counter = 0;
  return async function(time, buffer, validate = false) {
    let transferred = 0;
    const timer = new Timer();
    const queue = new Queue(buffer);
    const iterator = createIterator();
    const after = validate ? verify : noop;
    while(timer.elapsed() < time || !queue.isEmpty()) {
      for(let i = 0; i < 100; ++i) {
        const got = cb(queue);
        if(!isNullish(got)) {
          ++counter;
          after(got, iterator);
          transferred += 1;
        }
      }
    }
    return transferred;
  }
}


export async function init(kind = '', cb = noop) {
  const data = receiveMessageOnPort(parentPort);
  const value = await cb(...data.message);
  parentPort.postMessage({ type: 'result', value, kind });
};