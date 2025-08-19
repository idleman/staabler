import fs from 'fs-extra';
import { createRandomPath } from './utils.mjs';
import tryCatch from '@staabler/core/tryCatch.mjs';
import withValue from '@staabler/core/withValue.mjs';
import isNullish from '@staabler/core/isNullish.mjs';

export default class Directory {
  
  static getTmpPath() {
    return createRandomPath(`/tmp-${parseInt(Math.random()*2**24, 10)}/`);
  }

  static withTmpDir(...args) {
    const cb = args.pop();
    const path = Directory.getTmpPath(...args);
    fs.ensureDirSync(path);
    return withValue(tryCatch(() => cb(path)), ([value, err]) => {
      fs.removeSync(path);
      if(isNullish(err)) {
        return value;
      }
      throw err;
    });
  }

  static async ensure(path) {
    await fs.ensureDir(path);
    return path;
  }

};