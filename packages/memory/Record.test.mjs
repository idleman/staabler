import Record from './Record.mjs';
import { notStrictEqual, strictEqual } from 'node:assert';
import getPackageName from '@staabler/core/getPackageName.mjs';

describe(getPackageName(import.meta.url), function () {

  it('should support singular basic types', function () {
    const Type = Record({
      i8: 'Int8',
      i16: 'Int16',
      i32: 'Int32',
      u8: 'Uint8',
      u16: 'Uint16',
      u32: 'Uint32',
      bi64: 'BigInt64',
      bu64: 'BigUint64',
      f8: 'Float8',
      f16: 'Float16',
      f32: 'Float32',
      f64: 'Float64',
      bool: 'Boolean'
    });
    strictEqual(Type.BYTES_PER_ELEMENT, Type.MIN_BYTES_PER_ELEMENT);

    //strictEqual(Type, 46);
    const obj = new Type({
      i8: -128,
      i16: -32768,
      i32: -2147483648,
      u8: 255,
      u16: 65535,
      u32: 4294967295,
      bi64: BigInt(Number.MIN_SAFE_INTEGER),
      bu64: BigInt(Number.MAX_SAFE_INTEGER),
      f8: 1.5,
      f16: 3.14,
      f32: -12.345,
      f64: 1.7976931348623157e+308,
      bool: false
    });

    // Check getting values
    strictEqual(obj.i8, -128);
    strictEqual(obj.i16, -32768);
    strictEqual(obj.i32, -2147483648);
    strictEqual(obj.u8, 255);
    strictEqual(obj.u16, 65535);
    strictEqual(obj.u32, 4294967295);
    strictEqual(obj.bi64, BigInt(Number.MIN_SAFE_INTEGER));
    strictEqual(obj.bu64, BigInt(Number.MAX_SAFE_INTEGER));
    strictEqual(obj.f8, 1.5);
    strictEqual(obj.f16.toFixed(2), (3.14).toFixed(2));
    strictEqual(obj.f32.toFixed(3), (-12.345).toFixed(3));
    strictEqual(obj.f64, 1.7976931348623157e+308);
    strictEqual(obj.bool, false);

    // Check setting values
    obj.i8 = 127;
    obj.i16 = 32767;
    obj.i32 = 2147483647;
    obj.u8 = 0;
    obj.u16 = 0;
    obj.u32 = 0;
    obj.bi64 = 9223372036854775807n;
    obj.bu64 = 0n;
    obj.f8 = -1.5;
    obj.f16 = -3.14;
    obj.f32 = 42.42;
    obj.f64 = -1.797693;
    obj.bool = true;

    // Check if values were updated correctly
    strictEqual(obj.i8, 127);
    strictEqual(obj.i16, 32767);
    strictEqual(obj.i32, 2147483647);
    strictEqual(obj.u8, 0);
    strictEqual(obj.u16, 0);
    strictEqual(obj.u32, 0);
    strictEqual(obj.bi64, 9223372036854775807n);
    strictEqual(obj.bu64, 0n);
    strictEqual(obj.f8.toFixed(2), (-1.5).toFixed(2));
    strictEqual(obj.f16.toFixed(2), (-3.14).toFixed(2));
    strictEqual(obj.f32.toFixed(2), (42.42).toFixed(2));
    strictEqual(obj.f64, -1.797693);
    strictEqual(obj.bool, true);
  });

  const integers = [
    'Int8', 'Int16', 'Int32',
    'Uint8', 'Uint16', 'Uint32'
  ];

  it(`should support ${integers.join(', ')} arrays`, function () {
    const length = 3;
    const values = integers.map(() => Array.from({ length }, () => Math.round(Math.random() * 60)));
    const schema = integers.map(type => [type.toLowerCase(), type, length]);
    const Type = Record(schema);
    const obj = new Type(Object.fromEntries(schema.map(([name], index) => [name, values[index]])));
    
    schema.forEach(([name, schema], index) => {
      const got = obj[name];
      const expect = values[index];
      const expectBytesPerElement = parseInt(schema.replace(/\D/g, ''), 10)/8;
      const expectByteLength = expectBytesPerElement * length;
      strictEqual(got.byteLength, expectByteLength);
      strictEqual(got.BYTES_PER_ELEMENT, expectBytesPerElement);
      strictEqual(got.constructor, globalThis[`${schema}Array`]);
      strictEqual(got.join(','), expect.join(','));
    });
    
    schema.forEach(([name], index) => (obj[name] = values[index].map(v => v+v)));

    schema.forEach(([name, schema], index) => {
      const got = obj[name];
      const expect = values[index];
      const expectBytesPerElement = parseInt(schema.replace(/\D/g, ''), 10)/8;
      const expectByteLength = expectBytesPerElement * length;
      strictEqual(got.byteLength, expectByteLength);
      strictEqual(got.BYTES_PER_ELEMENT, expectBytesPerElement);
      strictEqual(got.constructor, globalThis[`${schema}Array`]);
      strictEqual(got.join(','), expect.map(v => v + v).join(','));
    });

  });

  const floats = ['Float32', 'Float64'];
  it(`should support ${floats.join(', ')} arrays`, function () {
    const length = 3;
    const values = floats.map(() => Array.from({ length }, () => Math.random()));
    const schema = floats.map(type => [type.toLowerCase(), type, length]);
    const Type = Record(schema);
    const obj = new Type(Object.fromEntries(schema.map(([name], index) => [name, values[index]])));
    
    schema.forEach(([name, schema], index) => {
      const got = obj[name];
      const expect = values[index];
      const expectBytesPerElement = parseInt(schema.replace(/\D/g, ''), 10)/8;
      const expectByteLength = expectBytesPerElement * length;
      strictEqual(got.byteLength, expectByteLength);
      strictEqual(got.BYTES_PER_ELEMENT, expectBytesPerElement);
      strictEqual(got.constructor, globalThis[`${schema}Array`]);
      for(let i = 0; i < length; ++i) {
        const diff = Math.abs(got[i] - expect[i]);
        strictEqual(diff <= 1, true);
      }
    });
    
    schema.forEach(([name], index) => (obj[name] = values[index].map(v => v+v)));

    schema.forEach(([name, schema], index) => {
      const got = obj[name];
      const expect = values[index];
      const expectBytesPerElement = parseInt(schema.replace(/\D/g, ''), 10)/8;
      const expectByteLength = expectBytesPerElement * length;
      strictEqual(got.byteLength, expectByteLength);
      strictEqual(got.BYTES_PER_ELEMENT, expectBytesPerElement);
      strictEqual(got.constructor, globalThis[`${schema}Array`]);
      for(let i = 0; i < length; ++i) {
        const diff = Math.abs(got[i] - expect[i]);
        strictEqual(diff <= 1, true);
      }
    });

  });

  const bigints = ['BigInt64', 'BigUint64'];
  it(`should support ${bigints.join(', ')} arrays`, function () {
    const length = 3;
    const values = bigints.map(() => Array.from({ length }, () => BigInt(Math.round(100 * Math.random()))));
    const schema = bigints.map(type => [type.toLowerCase(), type, length]);
    const Type = Record(schema);
    const obj = new Type(Object.fromEntries(schema.map(([name], index) => [name, values[index]])));

    schema.forEach(([name, schema], index) => {
      const got = obj[name];
      const expect = values[index];
      strictEqual(got.byteLength, length * 8);
      strictEqual(got.BYTES_PER_ELEMENT, 8);
      strictEqual(got.constructor, globalThis[`${schema}Array`]);
      strictEqual(got.join(','), expect.join(','));
    });
    
    schema.forEach(([name]) => {
      const curr = obj[name];
      for(let i = 0; i < length; ++i) {
        curr[i] += curr[i]; 
      }
    });

    schema.forEach(([name, schema], index) => {
      const got = obj[name];
      const expect = values[index];
      strictEqual(got.BYTES_PER_ELEMENT, 8);
      strictEqual(got.byteLength, length * 8);
      strictEqual(got.constructor, globalThis[`${schema}Array`]);
      strictEqual(got.join(','), expect.map(v => v + v).join(','));
    });

  });

  const customFloats = ['Float8', 'Float16'];
  it(`should support ${customFloats.join(', ')} arrays`, function () {
    const length = 3;
    const values = customFloats.map(() => Array.from({ length }, () => Math.random()));
    const schema = customFloats.map(type => [type.toLowerCase(), type, length]);
    const Type = Record(schema);
    const obj = new Type(Object.fromEntries(schema.map(([name], index) => [name, values[index]])));

    schema.forEach(([name, schema], index) => {
      const got = obj[name];
      const expect = values[index];
      const expectBytesPerElement = parseInt(schema.replace(/\D/g, ''), 10)/8;
      const expectByteLength = expectBytesPerElement * length;
      strictEqual(got.byteLength, expectByteLength);
      strictEqual(got.BYTES_PER_ELEMENT, expectBytesPerElement);
      for(let i = 0; i < length; ++i) {
        const diff = Math.abs(got[i] - expect[i]);
        strictEqual(diff <= 1, true);
      }
    });
    
    schema.forEach(([name], index) => (obj[name] = values[index].map(v => v+v)));

    schema.forEach(([name, schema], index) => {
      const got = obj[name];
      const expect = values[index];
      const expectBytesPerElement = parseInt(schema.replace(/\D/g, ''), 10)/8;
      const expectByteLength = expectBytesPerElement * length;
      strictEqual(got.byteLength, expectByteLength);
      strictEqual(got.BYTES_PER_ELEMENT, expectBytesPerElement);
      //strictEqual(got.constructor, globalThis[`${schema}Array`]);
      for(let i = 0; i < length; ++i) {
        const diff = Math.abs(got[i] - expect[i]);
        strictEqual(diff <= 1, true);
      }
    });

    schema.forEach(([name], index) => {
      const array = obj[name];
      values[index].forEach((v, i) => array[i] = v);
    });

    schema.forEach(([name, schema], index) => {
      const got = obj[name];
      const expect = values[index];
      const expectBytesPerElement = parseInt(schema.replace(/\D/g, ''), 10)/8;
      const expectByteLength = expectBytesPerElement * length;
      strictEqual(got.byteLength, expectByteLength);
      strictEqual(got.BYTES_PER_ELEMENT, expectBytesPerElement);
      //strictEqual(got.constructor, globalThis[`${schema}Array`]);
      for(let i = 0; i < length; ++i) {
        const diff = Math.abs(got[i] - expect[i]);
        strictEqual(diff <= 1, true);
      }
    });

  });

  it('should support Utf8 and Bytes type', function () {
      
    const User = Record({
      age: 'Uint8',
      name: 'Utf8',
      avatar: 'Bytes'
    });
    const john = new User({
      age: 10,
      name: 'John',
      avatar: Uint8Array.from([1, 2, 3])
    });
    
    // Check getting values
    strictEqual(john.age, 10);
    strictEqual(john.name, 'John');
    strictEqual(john.avatar.join(','), '1,2,3');
    
    // Check setting values
    john.name = 'JOHN';
    john.avatar = Uint8Array.from([4, 5, 6]);

    // Check if values were updated correctly
    strictEqual(john.age, 10);
    strictEqual(john.name, 'JOHN');
    strictEqual(john.avatar.join(','), '4,5,6');

    const copy = new User(john.buffer);
    strictEqual(copy.age, 10);
    strictEqual(copy.name, 'JOHN');
    strictEqual(copy.avatar.join(','), '4,5,6');
  });

  it('should be able to grow values', function () {
      
    const User = Record({
      token: 'Bytes',
      secret: 'Bytes',
      age: 'Uint8',
    });      
    const john = new User();

    // Check getting values
    strictEqual(john.age, 0);
    strictEqual(john.token.join(','), '');

    // Check setting values
    john.secret = Uint8Array.from([1]);
    john.token = Uint8Array.from([4,5,6]);
    // Check if values were updated correctly
    strictEqual(john.age, 0);
    strictEqual(john.secret.join(','), '1');
    strictEqual(john.token.join(','), '4,5,6');

    john.secret = Uint8Array.from([2,3]);
    john.token = Uint8Array.from([4,5,6,7,8]);
    
    strictEqual(john.secret.join(','), '2,3');
    strictEqual(john.token.join(','), '4,5,6,7,8');
  });

  
  it('should be able to shrink values', function () {
      
    const User = Record({ age: 'Uint8', token: 'Bytes', secret: 'Bytes' });      
    const john = new User({
      token: Uint8Array.from([1, 2, 3, 4]),
      secret: Uint8Array.from([4, 2]),
    });

    // Wrong initial size
    // Check getting values
    strictEqual(john.age, 0);
    strictEqual(john.secret.join(','), '4,2');
    strictEqual(john.token.join(','), '1,2,3,4');

    // Check setting values
    john.secret = Uint8Array.from([123]);
    john.token = Uint8Array.from([10, 20]);
    // Check if values were updated correctly
    strictEqual(john.age, 0);
    strictEqual(john.secret.join(','), '123');
    strictEqual(john.token.join(','), '10,20');

    john.token = Uint8Array.from([]);
    strictEqual(john.token.join(','), '');
    strictEqual(john.secret.join(','), '123');
  });

  
  it('should support Utf8 type', function () {
      
    const User = Record({ age: 'Uint8', first_name: 'Utf8', last_name: 'Utf8' });      
    const john = new User({
      age: 123,
      first_name: 'Unknown',
      last_name: 'Unknown',
    });

    // Check getting values
    strictEqual(john.age, 123);
    strictEqual(john.first_name, 'Unknown');
    strictEqual(john.last_name, 'Unknown');

    // Check setting values
    john.last_name = 'Doe';
    john.first_name = 'John';
    
    strictEqual(john.last_name, 'Doe');
    strictEqual(john.first_name, 'John');

    john.last_name = 'Doe321';
    john.first_name = 'John123';

    strictEqual(john.last_name, 'Doe321');
    strictEqual(john.first_name, 'John123');
  });

  it('should return the same record if it can', function () {
    
    // Only binary comparison
    const AA = Record({ age: 'Uint8', first_name: 'Utf8', last_name: 'Utf8' });
    const AB = Record({ age: 'Uint8', first_name: 'Utf8', last_name: 'Utf8' });
    strictEqual(AA, AB);
    
    // It should not re-order elements if not needed (to save space)
    const AC = Record({ age: 'Uint8', last_name: 'Utf8', first_name: 'Utf8' });
    notStrictEqual(AA, AC);

    // Same schema, different name
    const FooBirthDay = Record('FooBirthDay', { age: 'Uint8' });
    const BarBirthDay = Record('BarBirthDay', { age: 'Uint8' });
    notStrictEqual(FooBirthDay, BarBirthDay);
  });
});