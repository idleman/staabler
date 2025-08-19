import Cache from './Cache.mjs';
import Memory from './Memory.mjs';
import { strictEqual } from 'node:assert';

describe('Cache file', function() {
  
  const methods = [
    'read',
    'readSync'
  ];
  
  for(const method of methods) {

    it(`should cache all ${method} calls`, async function() {
      const memory = new Memory();
      const blob = Buffer.from('hello world');
      const cache = new Cache(memory);
      await cache.write(blob);
      strictEqual(Buffer.compare(memory.buffer, blob), 0);
      {
        const got = new Uint8Array(blob.byteLength);
        const bytesRead = await cache[method](got, { position: 0 });
        strictEqual(bytesRead, blob.byteLength);
        strictEqual(Buffer.compare(got, blob), 0);
      }
      memory.truncate();
      {
        
        const got = new Uint8Array(blob.byteLength);
        const bytesRead = await cache[method](got, { position: 0 });
        strictEqual(bytesRead, blob.byteLength);
        strictEqual(Buffer.compare(got, blob), 0);
      }
      // check if the cache works
  
    });

    it(`should be able to cache partial data`, async function() {
      const memory = new Memory();
      const blob = Uint8Array.from([1,2,3,4,5,6,7,8]);
      const cache = new Cache(memory);
      await cache.write(blob.subarray(0,4));
      {
        const got = new Uint8Array(4);
        const bytesRead = await cache[method](got, { position: 0 });
        strictEqual(bytesRead, 4);
      }
      await cache.write(blob.subarray(4));
      strictEqual(memory.buffer.byteLength, blob.byteLength);
      {
        const got = new Uint8Array(blob.byteLength);
        const bytesRead = await cache[method](got, { position: 0 });
        
        strictEqual(bytesRead, got.byteLength);
        strictEqual(Buffer.compare(got, blob), 0);
      }
      strictEqual(cache.cacheHits, 2);
      // check if the cache works
  
    });
  }

  it(`should be able to "peek"`, async function() {
    const memory = new Memory();
    const cache = new Cache(memory, 2);
    const blob = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);
    await cache.write(blob);
    strictEqual(Buffer.compare(memory.buffer, blob), 0);
    const first = cache.peek(4, 0);
    strictEqual(Buffer.compare(first, blob.subarray(0, 4)), 0);
    strictEqual(cache.cacheHits, 0);
    const second = cache.peek(4, 4);
    strictEqual(Buffer.compare(second, blob.subarray(4)), 0);
    
    // check if the cache works

  });
});