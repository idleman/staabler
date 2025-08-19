import Stream from './Stream.mjs';
import Record from '../Record.mjs';
import { strictEqual } from 'node:assert';
import File from '@staabler/filesystem/File.mjs';
import isThenable from '@staabler/core/isThenable.mjs';

import DefaultMap from '@staabler/core/DefaultMap.mjs';
import Cache from '@staabler/filesystem/file/Cache.mjs';
import getPackageName from '@staabler/core/getPackageName.mjs';

describe(getPackageName(import.meta.url), function() {
  
  const User = Record({
    name: 'Utf8',
    age: 'Uint8'
  })


  it('should support basic usage', async function() {
    let lastPosition = -1;
    const users = [];
    const file = new Cache(File.construct(':memory:', 'a+'));
    {
      const stream = new Stream(file);
    
      const people = [
        { name: 'John', age: 10 },
        { name: 'Jane', age: 20 },
        { name: 'Sarah', age: 30 },
      ];
      users.push(...people);
      const records = people.map(obj => new User(obj));
      stream.writeOneSync(records[0]);
      stream.writeManySync(records.slice(1));
      
      let counter = 0;
      for(const item of stream) {
        if(isThenable(item)) {
          break;
        }
        const [position, record] = item;
        lastPosition = position;
        const expect = people[counter++];
        strictEqual(record.age, expect.age);
        strictEqual(record.name, expect.name);
      }
      strictEqual(counter, people.length);
    }
    
    {
      const stream = new Stream(file);
    
      const people = [
        { name: 'Pete', age: 40 },
        { name: 'Adam', age: 50 },
        { name: 'Miranda', age: 60 },
      ];
      users.push(...people);
      const records = people.map(obj => new User(obj));
      stream.writeOneSync(records[0]);
      stream.writeManySync(records.slice(1));
      
      let counter = 0;
      const expect = users.slice(users.length - people.length - 1);
      for(const item of stream.createCursor(lastPosition)) {
        if(isThenable(item)) {
          break;
        }

        const [position, record] = item;
        const obj = expect[counter++];
        strictEqual(record.age, obj.age);
        strictEqual(record.name, obj.name);
      }
      strictEqual(counter, people.length + 1);
    }
    {
      let counter = 0;
      const stream = new Stream(file);
      for(const item of stream.createCursor()) {
        if(isThenable(item)) {
          break;
        }
        const [position, record] = item;
        const expect = users[counter++];
        strictEqual(record.age, expect.age);
        strictEqual(record.name, expect.name);
      }
      strictEqual(counter, users.length);
    }
  });



  const Reset = Record({
    id: 'Uint32',
    balance: 'Uint32'
  });

  const Transfer = Record({
    source: 'Uint32',
    amount: 'Uint32',
    destination: 'Uint32'
  });

  class Projection {
    
    constructor() {
      this.position = -1;
      this.accounts = new DefaultMap(() => 0);
    }

    match(Type) {
      return Type === Transfer || Type === Reset;
    }
   
    handle(record, position) {
      if(position <= this.position) {
        return;
      }
      this.position = position;
      switch(record.constructor) {
        case Reset:
          this.onReset(record);
          break;
        case Transfer:
          this.onTransfer(record);
          break;
      }
      
    }

    onReset(record) {
      this.accounts.set(record.id, record.balance);
    }

    onTransfer(record) {
      const accounts = this.accounts;
      const { amount, source, destination } = record;
      accounts.set(source, accounts.get(source) - amount);
      accounts.set(destination, accounts.get(destination) + amount); 
    }

  }

  it('should support inbuilt projection', function() {
    this.timeout(2000000);
    return File.withTmpFile(async src => {

      
      {
        const projection = new Projection();
        const stream = new Stream(new Cache(File.construct(src, 'a+')), projection);
        strictEqual(projection.accounts.get(1), 0);
        strictEqual(projection.accounts.get(2), 0);
        stream.writeOneSync(new Reset({ id: 1, balance: 100 }));
        stream.writeOneSync(new Reset({ id: 2, balance: 100 }));
        const transfers = Array.from({ length: 50 }, () => new Transfer({ source: 1, amount: 1, destination: 2 }));
        stream.writeManySync(transfers);
        strictEqual(projection.accounts.get(1), 50);
        strictEqual(projection.accounts.get(2), 150);
      }

      {
        const projection = new Projection();
        const stream = new Stream(new Cache(File.construct(src, 'a+')), projection);
        strictEqual(projection.accounts.get(1), 50);
        strictEqual(projection.accounts.get(2), 150);
      }
    });
  });

  it('should be able to copy the stream efficiently', function() {
    this.timeout(2000000);

    const source = new Stream(new Cache(File.construct(':memory:')));
    source.writeOneSync(new Reset({ id: 1, balance: 100 }));
    source.writeOneSync(new Reset({ id: 2, balance: 100 }));
    const transfers = Array.from({ length: 50 }, () => new Transfer({ source: 1, amount: 1, destination: 2 }));
    source.writeManySync(transfers);
    {
      const destination = new Cache(File.construct(':memory:'));
      source.copyTo(destination);
      const projection = new Projection();
      const target = new Stream(destination, projection);
      strictEqual(projection.accounts.get(1), 50);
      strictEqual(projection.accounts.get(2), 150);
    }
  });

  xit('should have decent performance', function() {
    this.timeout(2000000);
    return File.withTmpFile(async src => {

      let numberOfChunks = 0;
      const benchmarkTime = 10000;
      const chunk = Array.from({ length: 1024 }, () => new Transfer({ source: 1, amount: 1, destination: 2 }));
      const stream = new Stream(new Cache(File.construct(src, 'a+')));
      {
        const start = performance.now();
        while((performance.now() - start) < benchmarkTime) {
          for(let i = 0; i < 100; ++i) {
            stream.writeManySync(chunk);
            ++numberOfChunks;
          }
        }
        const time = performance.now() - start;
        const ops = (chunk.length*numberOfChunks)/(time * 0.001);
        console.log(`write: time=${time} ms, ${ops} ops`);
      }
      
      // console.log('Waiting...');
      // globalThis.resolver = Promise.withResolvers();
      // await globalThis.resolver.promise;
      
      {
        let got = 0;
        const start = performance.now();
        let lastPosition = 0;
        for(const maybe of stream) {
          if(isThenable(maybe)) {
            break;
          }
          ++got;
          const [position, record] = maybe;
          lastPosition = position;
          strictEqual(0 <= position, true);
          strictEqual(record.source, 1);
          strictEqual(record.amount, 1);
          strictEqual(record.destination, 2);
        }
        const time = performance.now() - start;
        const expected = chunk.length*numberOfChunks;
        const ops = (expected)/(time * 0.001);
        console.log(`read: time=${time} ms, ${ops} ops (bytes=${lastPosition/1024**2} Mb)`);
        strictEqual(got, expected);
        // console.log('DONE..');
        // globalThis.resolver = Promise.withResolvers();
        // await globalThis.resolver.promise;
      }
      
    });

    
  });

});