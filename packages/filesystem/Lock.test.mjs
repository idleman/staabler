import Lock from './Lock.mjs';
import File from './File.mjs';
import { throws } from 'node:assert';

describe('Lock', function() {

  it('should throw on concurrent use', function() {
    return File.withTmpFile(testFile => {
      {
        const lock = new Lock(testFile);
        try {
          throws(() => new Lock(testFile));
        } finally {
          lock.release();
        }
      }

      {
        const lock = new Lock(testFile);
        try {
          throws(() => new Lock(testFile));
        } finally {
          lock.release();
        }
      }

    });
  });

});