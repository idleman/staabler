import os from 'node:os';


export function createRandomString() {
  return Math
    .round(Math.random()*Number.MAX_SAFE_INTEGER)
    .toString(26);
};

export function createRandomPath(dir = '', ext = '') {
  return `${os.tmpdir()}${dir}${createRandomString()}${ext}`
    .replaceAll('\\', '/')
    .replaceAll('//', '/');
};