// lock.js
import * as fs from 'node:fs';
const getLockPath = filename => filename === ':memory:' ? null : `${filename}.lock`;

export default class Lock {
  
  /** 
   * Acquire a lock at `filename + '.lock'`. 
   * Throws if the lock already exists.
   * @param {string} filename
   */
  constructor(filename = ':memory:') {
    this.fd = filename === ':memory:' ? null : fs.openSync(getLockPath(filename), 'wx');
    this.filename = filename;
  }

  acquire() {
    const filename = this.filename;
    if(this.fd === null && filename !== ':memory:') {
      this.fd = fs.openSync(getLockPath(filename), 'wx');
    }
  }

  
  release() {
    if(this.fd === null) {
      return;
    }
    try {
      fs.closeSync(this.fd);
      this.fd = null;
    } finally {
      // ensure we clean up the file even if close() failed
      fs.unlinkSync(getLockPath(this.filename));
    }
  }

  [Symbol.dispose]() {
    this.release();
  }
}