import File from '../File.mjs';
import Native from './Native.mjs';
import { strictEqual } from 'node:assert';
import { readFileSync } from 'node:fs'; // FOr debugging

describe('Native file', function() {
  
  it('should write and read buffer', function() {
    return File.withTmpFile(async src => {
      const file = new Native(src, 'a+');
      const txt = 'hello world';
      const data = Buffer.from(txt);
      const out = Buffer.alloc(data.length);
  
      const bytesWritten = await file.write(data);
      strictEqual(bytesWritten, data.length);
      strictEqual(readFileSync(src, 'utf8'), txt);
  
      const bytesRead = await file.read(out, { position: 0 });
      strictEqual(bytesRead, data.length);
      strictEqual(Buffer.compare(out, data), 0);
    })
  });
  

  it('should write with offset and position', function() {
    return File.withTmpFile(async src => {
      const data = Buffer.from('ABCDEF');
      const out = Buffer.alloc(6);

      const file = new Native(src, 'a+');
      await file.write(data.subarray(0, 3), { offset: 0, length: 3, position: 0 });
      await file.write(data.subarray(3), { offset: 0, length: 3, position: 3 });

      const bytesRead = await file.read(out, { position: 0 });
      strictEqual(bytesRead, 6);
      strictEqual(out.toString(), 'ABCDEF');
    });
  });

  it('should read partial buffer', function() {
    return File.withTmpFile(async src => {
      const file = new Native(src, 'a+');
      const data = Buffer.from('1234567890');
      await file.write(data);

      const buf = Buffer.alloc(4);
      const bytesRead = await file.read(buf, { position: 3, length: 4 });
      strictEqual(bytesRead, 4);
      strictEqual(buf.toString(), '4567');
    });
  });

  it('should support writev and readv', function() {
    return File.withTmpFile(async src => {
      const file = new Native(src, 'a+');
      const part1 = Buffer.from('foo');
      const part2 = Buffer.from('bar');
      const output1 = Buffer.alloc(3);
      const output2 = Buffer.alloc(3);

      const written = await file.writev([part1, part2]);
      strictEqual(written, 6);

      const read = await file.readv([output1, output2], 0);
      strictEqual(read, 6);
      strictEqual(Buffer.concat([output1, output2]).toString(), 'foobar');
    });
  });

  it('should fstat size correctly', function() {
    return File.withTmpFile(async src => {
      const file = new Native(src, 'a+');
      await file.write(Buffer.from('hello'));
      const stat = await file.stat();
      strictEqual(stat.size, 5);
      strictEqual(stat.isFile(), true);
      strictEqual(stat.isDirectory(), false);
    });
  });

});