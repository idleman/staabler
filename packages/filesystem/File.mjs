import fs from 'fs-extra';
import Path from './Path.mjs';
import Native from './file/Native.mjs';
import Memory from './file/Memory.mjs';
import { createRandomPath } from './utils.mjs';
import tryCatch from '@staabler/core/tryCatch.mjs';
import isNullish from '@staabler/core/isNullish.mjs';
import withValue from '@staabler/core/withValue.mjs';

const defaultMatch = () => true;
const defaultCopyFilter = () => true;
const defaultWalkHandler = () => true;

async function runParallel(queue = [], cb = noop) {
  while(queue.length) {
    const [promise, result] = await Promise.race(queue);
    if(promise) {
      const index = queue.indexOf(promise);
      if(index !== -1) {
        queue.splice(index, 1);
      }
    }
    if(result === null || result === void(0)) {
      continue;
    }

    const maybe = cb(result);
    if(maybe === null || maybe === void(0)) {
      continue;
    }

    if(typeof maybe?.then === 'function') {
      const promise2 = maybe.then(obj => [promise2, obj]);
      queue.push(promise2);
      continue;
    }
    queue.push([null, maybe]);
  }
}

export default class File {
  
  static closeAll() {
    Native.closeAll();
  }

  static construct(filename = '', flag = '') {
    return  filename === ':memory:' ? new Memory() :
            new Native(filename, flag);
  }
  
  static close(filename) {
    Native.close(filename);
  }

  static unlinkSync(filename) {
    if(filename !== ':memory:') {
      fs.unlinkSync(filename);
    }
  }

  static getTmpPath(ext = '.tmp', dir = '') {
    return createRandomPath(dir, ext);
  }

  static withTmpFile(...args) {
    const cb = args.pop();
    const path = File.getTmpPath(...args);
    return withValue(tryCatch(() => cb(path)), ([value, err]) => {
      Native.close(path);
      try {
        fs.unlinkSync(path);
      } catch(err) { }
      if(isNullish(err)) {
        return value;
      }
      throw err;
    });
  }

  static async ensure(path = '') {
    await fs.ensureFile(path);
    return path;
  }

  static async walk(initial = '', cb = defaultWalkHandler) {
    const tests = [Path.toPath(Path.normalize(initial))];
    while(tests.length) {
    
      const dir = tests.shift();
      const iterable = await fs.readdir(dir, { withFileTypes: true });
      const entries = Array.from(iterable).sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of entries) {
        const type = entry.isDirectory() ? 'directory' : 'file';
        const path = Path.normalize(dir, entry.name);
        const check = await cb({ type, path });
        if(check && type === 'directory') {
          tests.push(path);
        }
      }
    }
  }

  static async find(dir, match = defaultMatch) {
    const result = [];
    await File.walk(dir, async item => {
      if(match(item)) {
        result.push(item);
      }
      return true;
    });
    return result;
  }

  static async copy(src, dest = '', {
    overwrite = true, 
    dereference = false,
    errorOnExist = false,
    preserveTimestamps = false,
    filter = defaultCopyFilter
  } = {}) {
    await fs.copy(src, dest, {
      filter,
      overwrite,
      dereference,
      errorOnExist,
      preserveTimestamps
    });
  }

};