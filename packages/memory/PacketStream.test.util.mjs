import noop from '@staabler/core/noop.mjs';
import Timer from '@staabler/core/Timer.mjs';
import PacketStream from './PacketStream.mjs';
import { parentPort, receiveMessageOnPort  } from 'node:worker_threads';

export const kMaxByteLength = 2**16;


export function createWriterImplementation(cb = noop) {
  return async function(time, buffer) {
    let ticks = 0;
    let transferred = 0;
    const timer = new Timer();
    const stream = new PacketStream(buffer);
    const head = stream.head;
    const tail = stream.tail;
    let sleepTime = 0;
    while(timer.elapsed() < time) {
      const initial = transferred;
      for(let i = 0; i < 100; ++i) {
        const position = head.value();
        const result = cb(stream);
        transferred += result;
        if(i === 0 && result === 0) {
          tail.notifyOne();
          const start = performance.now();
          head.wait(position, 100);
          sleepTime += (performance.now() - start);
          break;
        }
      }

      if(transferred === initial) {
        ++ticks;
      } else {
        tail.notifyOne();
      }
      // await sleep(100);
      // console.log(`writer(${transferred}): ${value}`);
    }
    // console.log('write', { ticks, sleepTime });
    return transferred;
  }
}


export function createReaderImplementation(cb = noop) {
  return async function(time, buffer) {
    let transferred = 0;
    const timer = new Timer();
    const stream = new PacketStream(buffer);
    const tail = stream.tail;
    const head = stream.head;
    let sleepTime = 0;
    let ticks = 0;
    while(timer.elapsed() < time || !stream.isEmpty()) {
      const initial = transferred;
      for(let i = 0; i < 100; ++i) {
        const position = tail.value();
        const result = cb(stream);
        transferred += result;
        if(result === 0) {
          head.notifyOne();
          const start = performance.now();
          tail.wait(position, 5);
          sleepTime += (performance.now() - start);
          break;
        }
      }
      // await sleep(100);
      // console.log(`reader(${transferred}): ${value}`);
      if(initial === transferred) {
        ++ticks;
      } else {
        head.notifyOne();
      }
    }

    // console.log('read', { ticks, sleepTime });
    return transferred;
  }
}


export async function init(kind = '', cb = noop) {
  const data = receiveMessageOnPort(parentPort);
  const value = await cb(...data.message);
  parentPort.postMessage({ type: 'result', value, kind });
}