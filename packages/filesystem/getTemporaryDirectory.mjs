import { createRandomPath } from './utils.mjs';

export default function getTemporaryDirectory(name = `/tmp-${parseInt(Math.random()*2**24, 10)}/`) {
  return createRandomPath(name);
};