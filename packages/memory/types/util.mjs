
import Int8 from './Int8.mjs';
import Int16 from './Int16.mjs';
import Int32 from './Int32.mjs';
import Uint8 from './Uint8.mjs';
import Uint16 from './Uint16.mjs';
import Uint32 from './Uint32.mjs';
import BigInt64 from './BigInt64.mjs';
import BigUint64 from './BigUint64.mjs';
import Float8 from './Float8.mjs';
import Float16 from './Float16.mjs';
import Float32 from './Float32.mjs';
import Float64 from './Float64.mjs';

import Utf8 from './Utf8.mjs';
import Bytes from './Bytes.mjs';
import Boolean from './Boolean.mjs';
import MultiIndex from '@staabler/core/MultiIndex.mjs';


const index = new MultiIndex(obj => {
  return [
    ['name', obj.name],
    ['Type', obj.Type]
  ];
});
const builtin = [
  ['Int8', Int8],
  ['Int16', Int16],
  ['Int32', Int32],
  
  ['Uint8', Uint8],
  ['Uint16', Uint16],
  ['Uint32', Uint32],
  
  ['BigInt64', BigInt64],
  ['BigUint64', BigUint64],
  
  ['Float8', Float8],
  ['Float16', Float16],
  ['Float32', Float32],
  ['Float64', Float64],

  ['Utf8', Utf8],
  ['Bytes', Bytes],
  ['Boolean', Boolean]
];

builtin.forEach(([name, Type]) => index.add({ name, Type }));

export function getTypeByName(name = '') {
  return index.get('name', name)?.Type;
};

export function getNameByType(Type = noop) {
  return index.get('Type', Type)?.name;
};


export function set(name = '', Type = noop) {

  const current = getTypeByName(name);
  if(current === Type) {
    return Type;
  }
  if(current) {
    throw new Error(`Already in use (name=${name})`);
  }

  const valid = (typeof Type.setValue === 'function' && typeof Type.getValue === 'function');
  if(!valid) {
    throw new Error(`Invalid Type (name=${name}, Type=${Type})`);
  }
  return Type;
};