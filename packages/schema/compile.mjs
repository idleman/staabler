import Ajv from 'ajv';
import withCache from '@staabler/core/withCache.mjs';

const ajv = new Ajv();

export default withCache(new WeakMap(), schema => ajv.compile(schema));