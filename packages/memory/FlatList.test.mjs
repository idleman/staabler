import getPackageName from '@staabler/core/getPackageName.mjs';
import Record from './Record.mjs';
import FlatList from './FlatList.mjs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {  

  const Type = Record({ id: 'Uint32', value: 'Uint32' });
  const List = FlatList(Type);

  describe('#resize', function() {
    
    it('should be able to change length and byteLength', function() {
      
      const records = new List();
      strictEqual(records.length, 0);
      strictEqual(records.buffer.byteLength, 0);

      records.resize(4);
      strictEqual(records.length, 4);
      strictEqual(records.buffer.byteLength, Type.BYTES_PER_ELEMENT * 4);
    });

    it('should be able to resize to a bigger than 4gb data size.', function() {
      const records = new List();
      strictEqual(records.length, 0);

      const numItems = Math.floor((5 * 1024**3)/Type.BYTES_PER_ELEMENT); // 4gb + 2
      records.resize(numItems);
      strictEqual(records.length, numItems);
      strictEqual(2**32 < records.buffer.byteLength, true);
      strictEqual(records.buffer.byteLength, Type.BYTES_PER_ELEMENT * numItems);
    });

  });

  describe('#push+pop', function() {
    
    it('should add new item to the end and remove it', function() {
      const records = new List();
      strictEqual(records.length, 0);
      strictEqual(records.buffer.byteLength, 0);

      {
        const obj = new Type({ id: 100, value: 200 });
        strictEqual(obj.id, 100 );
        strictEqual(obj.value, 200);
        strictEqual(records.push(obj), records);
        strictEqual(records.length, 1);
        const last = records.at(-1);
        strictEqual(last.id, 100);
        strictEqual(last.value, 200);
      }

      {
        const obj = new Type({ value: 50 });
        strictEqual(records.push(obj), records);
        strictEqual(records.length, 2);
        const last = records.at(-1);
        strictEqual(last.id, 0);
        strictEqual(last.value, 50);
      }

      
      records.pop();
      strictEqual(records.length, 1);
      
      records.pop();
      strictEqual(records.length, 0);
    });

  });
  
  describe('#unshift+shift', function() {
    
    it('should add new item to the start and remove it', function() {
      const records = new List();
      strictEqual(records.length, 0);
      
      {
        const obj = new Type({ value: 100 });
        strictEqual(records.unshift(obj), records);
        strictEqual(records.at(0).value, 100);
        strictEqual(records.length, 1);
      }

      {
        const obj = new Type({ value: 200 });
        strictEqual(records.unshift(obj), records);
        strictEqual(records.at(0).value, 200);
        strictEqual(records.length, 2);
      }

      {
        strictEqual(records.shift(), records);
        strictEqual(records.at(0).value, 100);
        strictEqual(records.length, 1);
      }

      {
        strictEqual(records.shift(), records);
        strictEqual(records.length, 0);
      }

    });

  });

  describe('#swap', function() {
    
    it('should be able to swap elements', function() {
      const records = new List();
      strictEqual(records.length, 0);
      
      {
        const objects = [50, 100, 200].map((value) => new Type({ value }));
        strictEqual(records.push(...objects), records);
        objects.forEach((record, i) => strictEqual(records.at(i).value, record.value))
        strictEqual(records.length, 3);
      }

      {
        records.swap(0, 2);        
        strictEqual(records.at(0).value, 200);
        strictEqual(records.at(1).value, 100);
        strictEqual(records.at(2).value, 50);
      }

      {
        records.swap(0, 1);        
        strictEqual(records.at(0).value, 100);
        strictEqual(records.at(1).value, 200);
        strictEqual(records.at(2).value, 50);
      }

    });

  });
  
  describe('#insert', function() {

    it('should be able to insert an item', function() {
      const Node = Record({ id: 'BigUint64', byteLength: 'BigUint64', byteOffset: 'BigUint64' });
      const Collection = FlatList(Node);
      const collection = new Collection();
      strictEqual(collection.length, 0);

      {
        strictEqual(collection.insert(0, { id: 1n, byteLength: 10n, byteOffset: 100n }), collection);
        strictEqual(collection.length, 1);
        strictEqual(collection.at(0).id, 1n);
        strictEqual(collection.at(0).byteLength, 10n);
        strictEqual(collection.at(0).byteOffset, 100n);
      }

      {
        strictEqual(collection.insert(1, { id: 2n, byteLength: 20n, byteOffset: 200n }), collection);
        strictEqual(collection.length, 2);
        strictEqual(collection.at(0).id, 1n);
        strictEqual(collection.at(0).byteLength, 10n);
        strictEqual(collection.at(0).byteOffset, 100n);
        strictEqual(collection.at(1).id, 2n);
        strictEqual(collection.at(1).byteLength, 20n);
        strictEqual(collection.at(1).byteOffset, 200n);
      }
      {
        strictEqual(collection.insert(1, { id: 3n, byteLength: 30n, byteOffset: 300n }), collection);
        strictEqual(collection.length, 3);
        strictEqual(collection.at(0).id, 1n);
        strictEqual(collection.at(0).byteLength, 10n);
        strictEqual(collection.at(0).byteOffset, 100n);
        strictEqual(collection.at(1).id, 3n);
        strictEqual(collection.at(1).byteLength, 30n);
        strictEqual(collection.at(1).byteOffset, 300n);
        strictEqual(collection.at(2).id, 2n);
        strictEqual(collection.at(2).byteLength, 20n);
        strictEqual(collection.at(2).byteOffset, 200n);
      }

      {
        strictEqual(collection.insert(0, { id: 4n, byteLength: 40n, byteOffset: 400n }), collection);
        strictEqual(collection.length, 4);
        strictEqual(collection.at(0).id, 4n);
        strictEqual(collection.at(0).byteLength, 40n);
        strictEqual(collection.at(0).byteOffset, 400n);
        strictEqual(collection.at(1).id, 1n);
        strictEqual(collection.at(1).byteLength, 10n);
        strictEqual(collection.at(1).byteOffset, 100n);
        strictEqual(collection.at(2).id, 3n);
        strictEqual(collection.at(2).byteLength, 30n);
        strictEqual(collection.at(2).byteOffset, 300n);
        strictEqual(collection.at(3).id, 2n);
        strictEqual(collection.at(3).byteLength, 20n);
        strictEqual(collection.at(3).byteOffset, 200n);
      }
    });

  });

  describe('collection methods', function() {

    describe('#find+findIndex', function() {
      
      it('should be able to find an item', function() {
        const records = new List();
        strictEqual(records.length, 0);
        
        
        const objects = [10, 20].map((value, index) => new Type({ id: index, value }));
        strictEqual(records.push(...objects), records);
        strictEqual(records.at(0).value, 10);
        strictEqual(records.at(1).value, 20);
        strictEqual(records.length, 2);
        
        const objA = records.find(obj => obj.value === 10);
        strictEqual(objA.id, 0);
        const objB = records.find(obj => obj.id === 1);
        strictEqual(objB.value, 20);

        strictEqual(records.find(obj => obj.value === 123), void(0));
      });

    });
    
    describe('#some+every', function() {

      it('should be check if some/every returns true', function() {
        const records = new List();
        strictEqual(records.length, 0);
        strictEqual(records.some(obj => obj.value === 300), false);
        strictEqual(records.every(obj => obj.value === 300), true);

        const objects = [10, 20, 30, 40, 50].map((value, index) => new Type({ id: index, value }))
        strictEqual(records.push(...objects), records);

        objects.forEach((expect, i) => strictEqual(records.at(i).value, expect.value));
        
        strictEqual(records.length, 5);
        
        strictEqual(records.every(obj => 0 < obj.value), true);
        strictEqual(records.every(obj => obj.value <= 30), false);
        strictEqual(records.some(obj => obj.value === 30), true);
        strictEqual(records.some(obj => obj.value === 300), false);

      });

    });
    

    describe('#sort', function() {

      it('should be able to sort by any field', function() {
        const records = new List();
        strictEqual(records.length, 0);
        
        {

          const objects = [40, 20, 50, 10, 30].map((value, index) => new Type({ id: 0, value: value }));
          strictEqual(records.push(...objects), records);
          objects.forEach((expect, i) => strictEqual(records.at(i).value, expect.value));
          strictEqual(records.length, 5);
        }
        
        {
          records.sort();
          strictEqual(records.at(0).value, 10);
          strictEqual(records.at(1).value, 20);
          strictEqual(records.at(2).value, 30);
          strictEqual(records.at(3).value, 40);
          strictEqual(records.at(4).value, 50);
        }
      });

    });

  });
  
});