import { init, createReaderImplementation } from './PacketStream.test.util.mjs';

await init('reader', createReaderImplementation(stream => {
  const array = stream.tryRead();
  return array ? array.byteLength : 0;
}));