import Memory from './Memory.mjs';
import { strictEqual } from 'node:assert';

describe('Memory file', function() {
  
  it('should write and read buffer', async function() {
    const file = new Memory();
    const data = Buffer.from('hello world');
    const out = Buffer.alloc(data.length);

    const bytesWritten = await file.write(data);
    strictEqual(bytesWritten, data.length);

    const bytesRead = await file.read(out);
    strictEqual(bytesRead, data.length);
    strictEqual(out.toString(), 'hello world');
  });

  it('should write with offset and position', async function() {
    const data = Buffer.from('ABCDEF');
    const out = Buffer.alloc(6);

    const file = new Memory();
    await file.write(data.subarray(0, 3), { offset: 0, length: 3, position: 0 });
    await file.write(data.subarray(3), { offset: 0, length: 3, position: 3 });

    const bytesRead = await file.read(out);
    strictEqual(bytesRead, 6);
    strictEqual(out.toString(), 'ABCDEF');
  });

  it('should read partial buffer', async function() {
    const file = new Memory();
    const data = Buffer.from('1234567890');
    await file.write(data);

    const buf = Buffer.alloc(4);
    const bytesRead = await file.read(buf, { position: 3, length: 4 });
    strictEqual(bytesRead, 4);
    strictEqual(buf.toString(), '4567');
  });

  it('should support writev and readv', async function() {
    const file = new Memory();
    const part1 = Buffer.from('foo');
    const part2 = Buffer.from('bar');
    const output1 = Buffer.alloc(3);
    const output2 = Buffer.alloc(3);

    const written = await file.writev([part1, part2]);
    strictEqual(written, 6);

    const read = await file.readv([output1, output2]);
    strictEqual(read, 6);
    strictEqual(Buffer.concat([output1, output2]).toString(), 'foobar');
  });

  it('should fstat size correctly', async function() {
    const file = new Memory();
    await file.write(Buffer.from('hello'));
    const stat = await file.stat();
    strictEqual(stat.size, 5);
    strictEqual(stat.isFile(), true);
    strictEqual(stat.isDirectory(), false);
  });

});