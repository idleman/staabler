import { init, createReaderImplementation } from './Stream.test.util.mjs';

await init('reader', createReaderImplementation((stream, data) => {
  return stream.tryRead(data) ? data.byteLength : 0;
}));