import { createRandomPath } from './utils.mjs';


export default function getTemporaryFile(ext = '.tmp', dir = '') {
  return createRandomPath(dir, ext);
};