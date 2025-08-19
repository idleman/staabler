import { init, createReaderImplementation } from './Queue.test.util.mjs';


await init('reader', createReaderImplementation(stream => {
  return stream.tryShift();
}));