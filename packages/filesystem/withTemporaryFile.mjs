import fs from 'fs-extra';
import getTemporaryDirectory from './getTemporaryDirectory.mjs';

export default async function withTemporaryDirectory(...args) {
  const cb = args.pop();
  const process = args.shift() ?? globalThis.process;
  const initial = process.cwd();
  const dir = getTemporaryDirectory();
  fs.ensureDirSync(dir);
  process.chdir(dir);
  const temporary = process.cwd();
  try {
    await cb(dir);
  } finally {
    if(process.cwd() === temporary) {
      process.chdir(initial);
    }
    for(let i = 0; i < 1024; ++i) {
      try {
        await fs.remove(dir);
        break;
      } catch(er) {
        if(i === 1023) {
          console.error(er);
        }
        throw err;
      }
    }
  }
};