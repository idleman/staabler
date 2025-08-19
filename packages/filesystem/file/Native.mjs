import os from 'node:os';
import * as fs from 'node:fs';
import autobind from '@staabler/core/autobind.mjs';
import isNullish from '@staabler/core/isNullish.mjs';
import DefaultMap from '@staabler/core/DefaultMap.mjs';

const pool = new Map();
const watchers = new DefaultMap(filename => {
  const subscribers = [];
  const watcher = fs.watch(filename, ev => subscribers.forEach(cb => cb(ev)));
  return [watcher, subscribers];
}); // filename => watcher


function addWatcher(filename, cb) {
  const [watcher, subscribers] = watchers.get(filename);
  subscribers.push(cb);
  return () => {
    const index = subscribers.indexOf(cb);
    if(index !== -1) {
      subscribers.splice(index, 1);
      if(subscribers.length !== 0) {
        return;
      }
      watcher.close();
      watchers.delete(filename);
    }
  }
}

const defaultOptions = {};
const MAX_FILES_OPEN = 1024;
const MAX_FILES_PER_PROCESS = Math.max(1, Math.floor(MAX_FILES_OPEN/Math.max(1, os.cpus().length)));
const seperator = '::|';

export default class Native {

  static close(filename = '') {
    Array
      .from(pool.entries())
      .filter(([identity]) => identity.startsWith(`${filename}${seperator}`))
      .forEach(([identity, fd]) => {
        fs.closeSync(fd);
        pool.delete(identity);
      });
    
    if(!watchers.has(filename)) {
      return;
    }
    const [watcher] = watchers.get(filename);
    watcher.close();
    watchers.delete(filename);
  }

  static closeAll() {
    Array
      .from(pool.keys())
      .forEach(identity => identity.substring(0, identity.indexOf(seperator)))
  }

  
  constructor(filename = '', flags = 'r') {
    autobind(this);
    this.flags = flags;
    this.filename = filename;
    this.identity = `${filename}${seperator}${flags}`;
    this.watcher = null;
    this.subscribers = [];
    
  }

  use(cb) {
    const identity = this.identity;
    const maybe = pool.get(identity);
    if(maybe) {
      // Make it a LRU (key insertion is preserved)
      pool.delete(identity);
      pool.set(identity, maybe);
      return cb(maybe);
    }

    if(MAX_FILES_PER_PROCESS <= pool.size) {
      const { value } = pool.entries().next();
      const [key, fd] = value;
      fs.closeSync(fd);
      pool.delete(key);
    }

    const fd = fs.openSync(this.filename, this.flags);
    pool.set(this.identity, fd);
    return cb(fd);
  }

  
  writeSync(buffer, options) {
    return this.use(fd => fs.writeSync(fd, buffer, options));
  }

  writevSync(buffers, position) {
    return this.use(fd => fs.writevSync(fd, buffers, position));
  }
  
  readSync(buffer, options) {
    return this.use(fd => fs.readSync(fd, buffer, options));
  }

  readvSync(buffers, position) {
    return this.use(fd => fs.readvSync(fd, buffers, position));
  }

  statSync(options) {
    return this.use(fd => fs.fstatSync(fd, options));
  }

  fdatasyncSync() {
    return this.use(fd => fs.fdatasyncSync(fd));
  }
  
  closeSync() {
    Native.close(this.filename);
  }

  write(buffer, options) {
    return this.use(fd => {
      const { reject, resolve, promise } = Promise.withResolvers();
      fs.write(fd, buffer, options, (err, bytesWritten) => isNullish(err) ? resolve(bytesWritten) : reject(err));
      return promise;
    });
  }

  writev(buffers, position) {
    return this.use(fd => {
      const { reject, resolve, promise } = Promise.withResolvers();
      fs.writev(fd, buffers, position, (err, bytesWritten) => isNullish(err) ? resolve(bytesWritten) : reject(err));
      return promise;
    });
  }
  
  read(buffer, options = defaultOptions) {
    return this.use(fd => {
      const { reject, resolve, promise } = Promise.withResolvers();
      fs.read(fd, buffer, options, (err, bytesRead) => isNullish(err) ? resolve(bytesRead) : reject(err));
      return promise;
    });
  }

  readv(buffers, position) {
    return this.use(fd => {
      const { reject, resolve, promise } = Promise.withResolvers();
      fs.readv(fd, buffers, position, (err, bytesRead) => isNullish(err) ? resolve(bytesRead) : reject(err));
      return promise;
    });
  }
  
  stat(options) {
    return this.use(fd => {
      const { reject, resolve, promise } = Promise.withResolvers();
      fs.fstat(fd, options, (err, stats) => isNullish(err) ? resolve(stats) : reject(err));
      return promise;
    });
  }


  close() {
    return Native.close(this.filename);
  }

  watch(cb) {
    return addWatcher(this.filename, cb);
  }

  lock() {
    
    return this.use(fd => {
      const { reject, resolve, promise } = Promise.withResolvers();
      fs.lock(fd, (err, locked) => isNullish(err) ? resolve(locked) : reject(err));
      return promise;
    });
  }

  [Symbol.dispose]() {
    return this.closeSync();
  }
};