import ajv from 'ajv';
import compile from './compile.mjs';

const { ValidationError } = ajv;

export default function validate(schema, value, defaultValue) {
  const validator = compile(schema);
  const isValid = validator(value);
  if(isValid) {
    return value;
  }

  if(defaultValue === void(0)) {
    throw new ValidationError(validator.errors);
  }

  return defaultValue;
};