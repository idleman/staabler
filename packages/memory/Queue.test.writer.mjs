import { init, createWriterImplementation } from './Queue.test.util.mjs';

await init('writer', createWriterImplementation((stream, value) => {
  return stream.tryPush(value);
}));