import { readFileSync, writeFileSync } from 'node:fs';
import isObjectLiteral from '@staabler/core/isObjectLiteral.mjs';


const isFalse = value => value === 'no' || value === 'false';
const isTrue = value => value === '' || value === 'true' || value === 'yes';
const containsWhitespace = str => str.includes(' ') || str.includes('\t');

function toValue(value) {
  if(isTrue(value)) {
    return true;
  }
  if(isFalse(value)) {
    return false;
  }
  if(containsWhitespace(value)) {
    return value;
  }
  const valueAsNumber = Number(value);
  return Number.isNaN(valueAsNumber) ? value : valueAsNumber;
}



function reduceToOption(acc, line) {
  const [key, value = ''] = line.split('=');
  acc[key] = toValue(value.trim());
  return acc;
}

export default class Config {

  static parse(data = '') {
    return data
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length && line.startsWith('#') === false)
      .reduce(reduceToOption, Object.create(null));
  }

  constructor(opt) {
    this.options = new Map();
    if(opt) {
      this.load(opt);
    }
  }

  reset() {
    this.options.clear();
    return this;
  }

  load(opt) {
    if(typeof opt === 'string') {
      opt = Config.parse(opt);
    }
    const entries = isObjectLiteral(opt) ? Object.entries(opt) : opt.entries();
    for(const [key, value] of entries) {
      this.options.set(key, value);
    }
  }

  loadFromFile(filename) {
    this.load(readFileSync(filename, 'utf8'));
  }

  saveToFile(filename) {
    writeFileSync(filename, this.toString());
  }

  get(key, defaultValue = void(0)) {
    return this.options.get(key) ?? defaultValue;
  }

  set(key, value) {
    this.options.set(key, value);
    return this;
  }

  toString() {
    return Array.from(this.options.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  }

};