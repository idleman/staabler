import { init, createWriterImplementation } from './Stream.test.util.mjs';

await init('writer', createWriterImplementation((stream, data) => {
  return stream.tryWrite(data) ? data.byteLength : 0;
}));