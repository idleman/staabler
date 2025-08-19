import Int8 from './types/Int8.mjs';
import Int16 from './types/Int16.mjs';
import Int32 from './types/Int32.mjs';
import Uint8 from './types/Uint8.mjs';
import Uint16 from './types/Uint16.mjs';
import Uint32 from './types/Uint32.mjs';
import BigInt64 from './types/BigInt64.mjs';
import BigUint64 from './types/BigUint64.mjs';
import Float8 from './types/Float8.mjs';
import Float16 from './types/Float16.mjs';
import Float32 from './types/Float32.mjs';
import Float64 from './types/Float64.mjs';

import Utf8 from './types/Utf8.mjs';
import Bytes from './types/Bytes.mjs';
import Boolean from './types/Boolean.mjs';
import { isLittleEndian } from './endianness.mjs';
import isNullish from '@staabler/core/isNullish.mjs';
import withCache from '@staabler/core/withCache.mjs';
import isObjectLiteral from '@staabler/core/isObjectLiteral.mjs';

/**
 * Available type constructors for Record fields.
 * @type {Object}
 */
const types = {
  Int8, Int16, Int32,
  Uint8, Uint16, Uint32,
  BigInt64, BigUint64,
  Float8, Float16, Float32, Float64,

  Utf8, Bytes, Boolean
};

/**
 * Array of typed array type names that can be used directly.
 * @type {string[]}
 */
const typedArrayTypes = [
  'Int8', 'Int16', 'Int32',
  'Uint8', 'Uint16', 'Uint32',
  'BigInt64', 'BigUint64',
  'Float32', 'Float64'
];

/**
 * Byte length for dynamic types (used for length headers).
 * @type {number}
 */
const kDynamicTypeByteLength = 4;

/**
 * Rounds a number up to the closest divisor.
 * 
 * @param {number} x - The number to round
 * @param {number} n - The divisor
 * @returns {number} The rounded number
 */
const roundToClosestDivisor = (x, n) => (x + (n-1)) &(-n);

/**
 * Converts a schema object or array to member definitions.
 * Sorts members by BYTES_PER_ELEMENT for optimal memory layout.
 */
const toMembers = (() => {

  /**
   * Compares two types for sorting by BYTES_PER_ELEMENT.
   * 
   * @param {Object} a - First type object
   * @param {Object} b - Second type object
   * @returns {number} Comparison result (-1, 0, or 1)
   */
  const compare = (a, b) => {
    //  It is important we do not change the order if not needed
    //  so the user can intentionally set the space.
    
    const a1 = a.BYTES_PER_ELEMENT;
    const b1 = b.BYTES_PER_ELEMENT;
    
    return  ((a1 && b1) || (a1 === void(0) && b1 === void(0))) ? 0 :
            a1 ? -1 :
            1;
  };

  /**
   * Validates that a key is valid for dot notation access.
   * 
   * @param {string} key - The key to validate
   * @returns {boolean} True if the key is valid, false otherwise
   */
  function isValidDotNotationKey(key) {
    // Must be a non-empty string
    if (typeof key !== 'string' || key.length === 0) return false;
  
    // Must start with a letter, underscore, or dollar sign, and contain only letters, digits, underscores, or dollar signs
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
  }

  /**
   * Maps schema entries to member definitions.
   * 
   * @param {Array} entry - Schema entry [name, identifier, length]
   * @returns {Object} Member definition object
   * @throws {Error} If the schema entry is invalid
   */
  const mapper = ([name, identifier, length = 1]) => {
    if(!(name !== 'buffer' && isValidDotNotationKey(name))) {
      throw new Error(`Invalid record name: "${name}"`);
    }

    if(!(1 <= length)) {
      throw new Error(`Invalid length value (got=${length})`);
    }
    
    const variadic = Array.isArray(identifier);
    const schema = variadic ? identifier[0] : identifier;
    const Type = types[schema];
    if(!Type) {
      throw new Error(`Unknown type: "${schema}"`);
    }

    if(variadic) {
      // The issue is a variadic type of say Uint32 must be properly padd(ed),
      // and if the elements before is dynamic, is it a lot more complex.
      throw new Error('Variadic schema(s) is unsupported');
    }

    const { BYTES_PER_ELEMENT } = Type;
    const dynamic = variadic || !BYTES_PER_ELEMENT;
    const minByteLength = variadic ? kDynamicTypeByteLength : (BYTES_PER_ELEMENT ?? kDynamicTypeByteLength) * length;

    if(dynamic && 1 < length) {
      // The issue is allow fast access and the poential overhead. An array of
      // 10 000 strings would require 10 000 length headers (4 byte) + iteration
      // to properly get its offset.
      throw new Error(`Array type for dynamic values (${schema}) is currenly unsupported`);
    }
    return {
      Type,
      name,
      length,
      schema,
      dynamic,
      variadic,
      minByteLength,
      BYTES_PER_ELEMENT
    };
  }

  /**
   * Adds byte offset to member definitions.
   * 
   * @param {Array} members - Array of member definitions
   * @param {Object} member - Member definition to add
   * @returns {Array} Updated members array
   */
  const addByteOffset = (members, member) => {
    const prev = members.at(-1);
    const { BYTES_PER_ELEMENT } = member;
    const suggestion =  prev ? (prev.byteOffset + prev.minByteLength) : 0;
    const byteOffset =  roundToClosestDivisor(suggestion, BYTES_PER_ELEMENT ?? kDynamicTypeByteLength);
    members.push({ ...member, byteOffset });
    return members;
  }

  /**
   * Converts a schema object or array to member definitions.
   * 
   * @param {Object|Array} obj - Schema object or array
   * @returns {Array} Array of member definitions
   */
  return (obj = []) => {
    const entries = Array.isArray(obj) ? obj : Object.entries(obj);
    
    return entries
      .map(mapper)
      .sort(compare)
      .reduce(addByteOffset, []);
  }
})();

/**
 * Code builder utility for generating class code.
 * 
 * @param {string} space - Initial indentation space
 * @returns {Object} Builder object with push, getBody, and pushLine methods
 */
function builder(space = '') {

  let body = '';
  const getBody = () => body;
  const indent = () => void(space = `${space}  `);
  const outdent = () => void(space = space.substring(0, space.length - 2));
  const pushLine = str => {
    const code = str.trim();
    if(code.endsWith('}')) {
      outdent();
    }
    const result = `${space}${code.trim()}\n`;
    if(code.endsWith('{')) {
      indent();
    }
    
    body = `${body}${result}`;
  };

  const push = str => {
    str
      .trim()
      .split('\n')
      .forEach(line => {
        const code = line.trim();
        if(code) {
          pushLine(code + `\n`);
        }
      })
  }

  return {
    push,
    getBody,
    pushLine
  }
}

/**
 * Converts member definitions back to a schema object or array.
 * 
 * @param {Array} members - Array of member definitions
 * @returns {Object|Array} Schema object or array
 */
function toSchema(members = []) {
  let lengthy = false;
  const entries = members.map(obj => {
    const { name, schema, length } = obj;
    if(1 < length) {
      lengthy = true;
      return [name, schema, length];
    }
    return [name, schema];
  });

  return lengthy ? entries : Object.fromEntries(entries);
}

/**
 * Shared cache for Record classes to avoid duplicate class creation.
 * @type {Map}
 */
const shared = new Map();

/**
 * Creates a static proxy handler for array-like access to typed array fields.
 * 
 * @param {Object} member - Member definition
 * @returns {Object} Proxy handler object
 */
function createStaticProxyHandler(member) {
  const { Type, length, byteOffset } = member;
  const { getValue, setValue, BYTES_PER_ELEMENT } = Type;

  let keys;
  const toArray = buffer => Array.from({ length }, (_, index) => getValue(buffer, byteOffset + index * BYTES_PER_ELEMENT));
  const ownKeys = () => {
    if(!keys) {
      keys = Array
        .from({ length }, (_, index) => index.toString())
        .concat(['array', 'buffer', 'length', 'byteOffset', 'byteLength', 'BYTES_PER_ELEMENT']);
    }
    return keys;
  };
  const has = (_, key) => ownKeys().includes(key);
  const get = (target, key) => {
    const index = parseInt(key, 10);
    if(0 <= index && index < length) {
      return getValue(target[0].buffer, byteOffset + index * BYTES_PER_ELEMENT);
    }

    
    switch(key) {
      // we avoid those functionality that would be resource intensive to emulate
      case 'length': return length;
      case 'byteOffset': return byteOffset;
      case 'byteLength': return length*BYTES_PER_ELEMENT;
      case 'BYTES_PER_ELEMENT': return BYTES_PER_ELEMENT;
      case 'buffer': return target[0].buffer;
      case 'array': return toArray(target[0].buffer);
    }
  };

  const set = (target, key, value) => {
    const index = parseInt(key, 10);
    if(0 <= index && index < length) {
      const [instance] = target;
      setValue(instance.buffer, byteOffset + index * BYTES_PER_ELEMENT, value);
      return true;
    }
  };

  
  return {
    get,
    set,
    has,
    ownKeys
  };
}

/**
 * Creates a factory function for getting dynamic byte offsets.
 * 
 * @param {Array} members - Array of member definitions
 * @param {number} minByteLength - Minimum byte length
 * @returns {Function} Function that returns byte offset for a given index
 */
function getDynamicByteOffsetFactory(members, minByteLength) {
  const getOffsets = withCache(new WeakMap(), buffer => {
    const offsets = [];    
    let offset = minByteLength;
    for(const member of members) {
      const { length, byteOffset } = member;
      
      if(!member.dynamic) {
        offsets.push(member.byteOffset);
        continue;
      }

      // No member here has a fixed BYTES_PER_ELEMENT
      if(length === 1) {
        // Bytes/Utf8
        offsets.push(offset);
        const byteLength = Uint32.getValue(buffer, byteOffset);
        offset += byteLength;
        continue;
      }
    }
    return offsets;
  });

  return (buffer, index) => {
    const offsets = getOffsets(buffer);
    return offsets[index];
  };
}

/**
 * Creates a buffer template for the Record type.
 * 
 * @param {Array} members - Array of member definitions
 * @param {number} minByteLength - Minimum byte length
 * @returns {Uint8Array} Template buffer
 */
function createBufferTemplate(members, minByteLength) {
  const buffer = new Uint8Array(minByteLength);
  members.forEach(member => {
    if(member.length === 1 && !member.BYTES_PER_ELEMENT) {
      Uint32.setValue(buffer, member.byteOffset, minByteLength);
    }
  });
  return buffer;
}

/**
 * Empty Record class for schemas with no fields.
 */
class EmptyRecord {
  static schema = {};
  static MIN_BYTES_PER_ELEMENT = 0;
  static BYTES_PER_ELEMENT = 0;

  /**
   * Creates a new EmptyRecord instance.
   * 
   * @param {ArrayBuffer|SharedArrayBuffer} buffer - The underlying buffer
   */
  constructor(buffer) {
    this.buffer = buffer;
  }
}

/**
 * Creates a Record class with the specified schema.
 * Generates optimized code for memory-efficient record access.
 * 
 * @param {...*} args - Arguments including schema definition
 * @returns {Function} Record class constructor
 */
export default function Record(...args) {
  const template = args.pop();
  const name = args.pop() || 'Record';
  const members = toMembers(template);
  if(members.length === 0) {
    return EmptyRecord;
  }

  const schema = toSchema(members);
  const schemaAsJson = JSON.stringify([name, schema]);
  const cached = shared.get(schemaAsJson);
  if(cached) {
    return cached;
  }

  const dynamic = members.some(obj => obj.dynamic);
  const last = members.at(-1);
  const minByteLength = last.byteOffset + last.minByteLength;
  const defaultBuffer = createBufferTemplate(members, minByteLength);
  
  // Instead of using dynamic offsets, make each dynamic object to 8 bytes
  // offset.
  // throw new Error('getDynamicByteOffset cannot be used');

  const getDynamicByteOffset = getDynamicByteOffsetFactory(members, minByteLength);

  const imports = { ...types, defaultBuffer, isNullish, isObjectLiteral, getDynamicByteOffset };
  
  members.forEach((member, index) => {
    const {  length, BYTES_PER_ELEMENT } = member;
    const isArray = 1 < length;
    if(BYTES_PER_ELEMENT && isArray) {
      imports[`createArrayLike${index}`] = withCache(new WeakMap(), instance => new Proxy([instance], createStaticProxyHandler(member)));
    }

    if(!BYTES_PER_ELEMENT && !isArray) {
      imports[`getByteOffset${index}`] = buffer => getDynamicByteOffset(buffer, index);
    }
  })

  const { push, getBody } = builder();
  push(`
    "use strict";
    const { ${Object.keys(imports).join(', ')} } = imports;
  `);
    
  push(`
    return class ${name} {
      static schema = ${schemaAsJson};

      static MIN_BYTES_PER_ELEMENT = ${minByteLength};
      ${dynamic ? '' : `static BYTES_PER_ELEMENT = ${minByteLength}`}

      constructor(bufferOrArg) {
        const buffer = (bufferOrArg?.constructor === Uint8Array) ? bufferOrArg : structuredClone(defaultBuffer); //new Uint8Array(${minByteLength});
        if(buffer.byteLength < ${minByteLength}) {
          throw new Error('Buffer too small (expected=${minByteLength}, got=\${buffer.byteLength}');
        }
        this.buffer = buffer;
        if(isObjectLiteral(bufferOrArg)) {
  `);
  
  members.forEach((member, index) => {
    const { name } = member;
    push(`
      const value${index} = bufferOrArg.${name};
      if(!isNullish(value${index})) {
        this.${name} = value${index};
      }
    `);
  });
  push('}'); // END if
  push('}'); // END constructor

  push(`
    toJS() {
      return {
        ${members.map(({ name }) => `${name}: this.${name}`).join(', ')}
      };
    }
  `);

  
  const lastIndex = members.length - 1;
  members.forEach((member, index) => {
    const { name, Type, length, schema, byteOffset } = member;
    const { BYTES_PER_ELEMENT } = Type;
    const isArray = 1 < length;
    if(BYTES_PER_ELEMENT && !isArray) {
      push(`
        get ${name}() {
          return ${schema}.getValue(this.buffer, ${byteOffset});
        }
        set ${name}(value) {
          ${schema}.setValue(this.buffer, ${byteOffset}, value);
        }
      `);
      return;
    }

    if(!isArray) {
      // Store only offsets: we save 4 bytes per dynamic field if we derive length by subtracting the next offset with the current one
      push(`
        get ${name}() {
          const buffer = this.buffer;
          const offset = Uint32.getValue(buffer, ${byteOffset});
          const length = ${lastIndex === index ? 'buffer.byteLength' : `Uint32.getValue(buffer, ${members[index+1].byteOffset})`} - offset;
          return ${schema}.getValue(buffer, offset, length);
        }
      
        set ${name}(value) {
          const buffer = this.buffer;
          const offset = Uint32.getValue(buffer, ${byteOffset});
          const nextLength = ${schema}.getByteLengthOf(value);
          const currentLength = (${lastIndex === index ? 'buffer.byteLength' : `Uint32.getValue(buffer, ${members[index+1].byteOffset})`}) - offset;
          const diffLength = nextLength - currentLength;
          if(diffLength === 0) {
            return ${schema}.setValue(buffer, offset, value, nextLength);
          }

          const nextByteLength = buffer.byteLength + diffLength;
          if(0 < diffLength) {
            const newBuffer = new Uint8Array(nextByteLength);
            newBuffer.set(buffer.subarray(0, offset));
            newBuffer.set(buffer.subarray(offset), offset + diffLength);
            this.buffer = newBuffer;
          } else {
            const len = (-diffLength);
            buffer.copyWithin(offset, offset + len);
            this.buffer = buffer.subarray(0, nextByteLength);
          }   
      `);
      if(index !== lastIndex) {
        members.slice(index + 1).forEach(({ byteOffset, length, BYTES_PER_ELEMENT }) => {
          push(`Uint32.setValue(this.buffer, ${byteOffset}, Uint32.getValue(buffer, ${byteOffset}) + diffLength);`);
        });
      }
      push(`
          ${schema}.setValue(this.buffer, offset, value, nextLength);
        }
      `);
      return;
    }

    const isTypedArrayType = typedArrayTypes.includes(schema);
    if(BYTES_PER_ELEMENT && isArray && isTypedArrayType && (isLittleEndian || BYTES_PER_ELEMENT === 1)) {
      // We can construct the data directly because we do not need to wory about endianess        
      push(`
        get ${name}() {
          return new ${schema}Array(this.buffer.buffer, ${byteOffset}, ${length});
        }
        set ${name}(value) {
          this.${name}.set(value);
        }
      `);
      return;
    }

    if(BYTES_PER_ELEMENT && isArray) {
      // Float8/16 Boolean
      push(`
        get ${name}() {
          return createArrayLike${index}(this);
        }
        set ${name}(value) {
          let index = -1;
          for(const val of value) {
            if(++index === ${length}) {
              break;
            }
            ${schema}.setValue(this.buffer, ${byteOffset} + index*${BYTES_PER_ELEMENT}, val);
          }
        }
      `);
      return;
    }

  });
  push('}');

  const construct = new Function('imports', getBody()); //
  const Type = construct(imports);
  shared.set(schemaAsJson, Type);
  return Type;
};