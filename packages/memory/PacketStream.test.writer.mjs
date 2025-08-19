
import withCache from '@staabler/core/withCache.mjs';
import { init, createWriterImplementation } from './PacketStream.test.util.mjs';

const getArray = withCache(new Map(), byteLength => {
  const array = new Uint8Array(byteLength);
  for(let i = 0; i < byteLength; ++i) {
    array[i] = i%byteLength;
  }
  return array;
});

const byteLength = 2**(8 + Math.round(Math.random()**8));
await init('writer', createWriterImplementation(stream => {
  const array = getArray(byteLength);
  return stream.tryWrite(array) ? byteLength : 0;
}));