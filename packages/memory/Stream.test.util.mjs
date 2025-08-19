import Stream from './Stream.mjs';
import noop from '@staabler/core/noop.mjs';
import Timer from '@staabler/core/Timer.mjs';
import { threadId, parentPort, receiveMessageOnPort  } from 'node:worker_threads';


export const kMaxByteLength = 2**16;

export function* createIterator() {
  let id = 0;
  while(true) {
    id = (++id)%254;
    yield id;
  }
}


export function verify(array, iterator, length = 0) {
  for(let i = 0; i < length; ++i) {
    const got = array[i];
    const expect = iterator.next().value;
    if(got !== expect) {
      throw new Error(`${threadId}: Validation failed (got=${got}, expect=${expect}, length=${length}, index=${i})`);
    }
  }
}

let iteratorResult = {};
export function produce(array, iterator, length = 0) {
  for(let i = 0; i < length; ++i) {
    iteratorResult = iterator.next();
    array[i] = iteratorResult.value;
  }
}


export function createWriterImplementation(cb = noop) {
  let counter = 0;
  return async function(time, buffer, validate = false) {
    let transferred = 0;
    const timer = new Timer();
    const stream = new Stream(buffer);
    const capacity = stream.capacity();
    if(capacity < kMaxByteLength) {
      throw new Error(`Stream capacity (${capacity}) must at least be ${kMaxByteLength} bytes`);
    }
    const iterator = createIterator();
    const before = validate ? produce : noop;
    const data = new Uint8Array(kMaxByteLength);
    let iterate = true;
    while(timer.elapsed() < time) {
      if(iterate) {
        before(data, iterator, kMaxByteLength);
        iterate = false;
      }
      ++counter;
      const bytesWritten = await cb(stream, data);
      if(!bytesWritten) {
        continue;
      }
      iterate = true;
      transferred += bytesWritten;
    }
    return transferred;
  }
}


export function createReaderImplementation(cb = noop) {
  let counter = 0;
  return async function(time, buffer, validate = false) {
    let transferred = 0;
    const timer = new Timer();
    const stream = new Stream(buffer);
    const capacity = stream.capacity();
    if(capacity < kMaxByteLength) {
      throw new Error(`Stream capacity (${capacity}) must at least be ${kMaxByteLength} bytes`);
    }
    const data = new Uint8Array(kMaxByteLength);
    const iterator = createIterator();
    const after = validate ? verify : noop;
    while(timer.elapsed() < time || !stream.isEmpty()) {
      ++counter;
      const bytesReaded = await cb(stream, data);
      if(!bytesReaded) {
        continue;
      }
      after(data, iterator, bytesReaded);
      transferred += bytesReaded;
    }
    return transferred;
  }
}


export async function init(kind = '', cb = noop) {
  const data = receiveMessageOnPort(parentPort);
  const value = await cb(...data.message);
  parentPort.postMessage({ type: 'result', value, kind });
}