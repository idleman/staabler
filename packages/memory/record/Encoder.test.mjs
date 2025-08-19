import Record from '../Record.mjs';
import Encoder from './Encoder.mjs';
import Decoder from './Decoder.mjs';
import Uint32 from '../types/Uint32.mjs';
import { strictEqual } from 'node:assert';
import Timer from '@staabler/core/Timer.mjs';
import getPackageName from '@staabler/core/getPackageName.mjs';

describe(getPackageName(import.meta.url), function() {

  // Example: Using pipe with async generators
  
  const User = Record({
    age: 'Uint32',
    name: 'Utf8'
  });

  it('should support basic usage', async function() {
    const encoded = [];
    {
      const encoder = new Encoder();
      const john = new User({ age: 10, name: 'John' });
      const sarah = new User({ age: 20, name: 'Sarah' });
      encoded.push(Uint8Array.from(encoder.encode(john)));
      encoded.push(Uint8Array.from(encoder.encode(sarah)));
    }
    
    const decoded = [];
    {
      const decoder = new Decoder();
      for await (const buf of encoded) {
        // The decoder own the memory so after the next iteration it changes.
        const expectByteLength = Uint32.getValue(buf, 0);
        strictEqual(expectByteLength, buf.byteLength);
        const obj = decoder.decode(buf);
        decoded.push({ age: obj.age, name: obj.name });
      }

    }

    strictEqual(decoded.length, 2);
    strictEqual(decoded[0].age, 10);
    strictEqual(decoded[0].name, 'John');
    strictEqual(decoded[1].age, 20);
    strictEqual(decoded[1].name, 'Sarah');
  });

  it('should have decent performance', async function() {
    const time = 60_000;
    this.timeout(time*10);
    let byteLength = 0;
    const length = 10_000;
    const user = new User();
    const encoder = new Encoder();
    const decoder = new Decoder();
    const timer = new Timer();
    
    
    for(let i = 0; i < length; ++i) {
      const expect = {
        age: Math.round(Math.random()*255),
        name: `a huge common string that is very ${Math.round(Math.random()*10).toString(36)}`
      };
      const view = encoder.encode(Object.assign(user, expect));
      byteLength += view.buffer.byteLength;
      const got = decoder.decode(view);
      strictEqual(got.age, expect.age);
      strictEqual(got.name, expect.name);
    }
      
    const elapsed = timer.elapsed();
    const ops = Math.round(length/(elapsed*0.001));
    strictEqual(10_000 < ops, true);
    // const byteLengthInMb = (byteLength/1024**2).toFixed(2);
    // const speedInMb = (byteLengthInMb/(elapsed*0.001)).toFixed(2);
    // console.log('Performance', {
    //   ops,
    //   speedInMb,
    //   byteLengthInMb
    // })
  });

  xit('should have decent performance (benchmark)', async function() {
    const time = 60_000;
    this.timeout(time*10);
    const views = [];
    let byteLength = 0;
    const length = 10_000_000;
    const user = new User();
    const encoder = new Encoder();
    const decoder = new Decoder();
    {
      const timer = new Timer();
      views.push(Uint8Array.from(encoder.encode(Object.assign(user, {
        age: Math.round(Math.random()*255),
        name: `a huge common string that is very ${Math.round(Math.random()*10).toString(36)}`
      }))));
      for(let i = 0; i < length; ++i) {
        const view = encoder.encode(Object.assign(user, {
          age: Math.round(Math.random()*255),
          name: `a huge common string that is very ${Math.round(Math.random()*10).toString(36)}`
        }));

        byteLength += view.buffer.byteLength;
        views[1] = view;
      }
      
      const elapsed = timer.elapsed();
      const ops = Math.round(length/(elapsed*0.001));
      const byteLengthInMb = (byteLength/1024**2).toFixed(2);
      const speedInMb = (byteLengthInMb/(elapsed*0.001)).toFixed(2);
      console.log('Encode', {
        ops,
        speedInMb,
        byteLengthInMb
      })
    }

    {
      
      const timer = new Timer();
      decoder.decode(views[0]);
      for(let i = 0; i < length; ++i) {
        const obj = decoder.decode(views[1]);
        const age = obj.age;
        strictEqual(Number.isSafeInteger(age), true);
      }
      
      const elapsed = timer.elapsed();
      const ops = Math.round(length/(elapsed*0.001));
      const byteLengthInMb = (byteLength/1024**2).toFixed(2);
      const speedInMb = (byteLengthInMb/(elapsed*0.001)).toFixed(2);
      console.log('Decode', {
        ops,
        speedInMb,
        byteLengthInMb
      })
    }
  });

  

  
});