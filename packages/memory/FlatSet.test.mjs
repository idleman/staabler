import Record from './Record.mjs';
import FlatSet from './FlatSet.mjs';
import { strictEqual } from 'node:assert';
import compare from '@staabler/core/compare.mjs';
import {  withMemoryAnalytics } from './test-utils.mjs';
import getPackageName from '@staabler/core/getPackageName.mjs';

describe(getPackageName(import.meta.url), function() {  

  const Type = Record({
    id: 'Uint32',
    value: 'Uint32'
  });
  
  const Set = FlatSet(Type);

  it('should be support basic usage', function() {
    
    const people = new Set();
    //const people = new List(new ArrayBuffer(Person.BYTES_PER_ELEMENT, { maxByteLength: Person.BYTES_PER_ELEMENT*2 }));
    strictEqual(people.size, 0);
    
    people.add({ id: 1, value: 10 });
    strictEqual(people.size, 1);
    people.add({ id: 1, value: 10 });
    strictEqual(people.size, 1);
    const person = people.at(-1);
    strictEqual(person.id, 1);
    strictEqual(person.value, 10);
  

    people.add({ id: 2, value: 20 });
    strictEqual(people.size, 2);
    strictEqual(people.handle(0).id, 1);
    strictEqual(people.handle(0).value, 10);
    strictEqual(people.handle(1).id, 2);
    strictEqual(people.handle(1).value, 20);

    // Should be inserted in the middle
    people.add({ id: 2, value: 15 });
    strictEqual(people.size, 3);
    strictEqual(people.handle(0).id, 1);
    strictEqual(people.handle(0).value, 10);
    strictEqual(people.handle(1).id, 2);
    strictEqual(people.handle(1).value, 15);

    strictEqual(people.handle(2).id, 2);
    strictEqual(people.handle(2).value, 20);
    
    
  });

  it('should support range search', function() {
    const people = new Set();
    people.add({ id: 10, value: 1 });
    people.add({ id: 20, value: 2 });
    people.add({ id: 30, value: 3 });
    people.add({ id: 40, value: 4 });
    people.add({ id: 50, value: 5 });
    people.add({ id: 30, value: 6 });
    people.add({ id: 30, value: 7 });
    people.add({ id: 10, value: 8 });
    people.add({ id: 40, value: 9 });

    const [ lower, upper ] = people.range(obj => compare(obj.id, 30));    
    const length = upper - lower + 1;
    for(let i = 0; i < length; ++i) {
      strictEqual(people.handle(lower + i).id, 30);
      strictEqual(people.handle(lower + i).value, people.handle(lower).value + i);
    }
    
  });
  

  //  Activate this test measure memory efficient it really is. However,
  //  its insert performance will dramatically decrease if the underlying
  //  memory buffer is large, because it need to move every item one step
  //  to right after inserted item.
  
  xit('should be memory efficient', function() {

    this.timeout(999999999);
    const Node = Record({
      key: 'Uint32',
      value: 'Uint32'
    });

    const Set = FlatSet(Node);
    
    const TEST_GOOD_IMPL = true; // CHANGE THIS TO FALSE TO CHECK THE BAD IMPLEMENATION (see below)
    const length = 2**24 - 1; //2**24-1;//1024*100;
    const createImplmentation = TEST_GOOD_IMPL ? createGoodImplementation : createBadImplementation; // createRandomImplementation
    const implmenation = createImplmentation(length);
    const runTest = withMemoryAnalytics(implmenation.test);
    
    runTest.set({ length, BYTES_PER_ELEMENT: Node.BYTES_PER_ELEMENT, TEST_GOOD_IMPL });
      
    runTest();
    const result = runTest
      .getMemoryUsage()
      .toUnits();
    
    console.log('\n', result);
    implmenation.verify();
    // strictEqual(result.cost < 10, true);



    function createGoodImplementation(length = 0) {
      // This implementation will be lot more memory efficient
      //  We change the items of the FlatSet to make the test faster
      const set = new Set();
      set.items.resize(length);
      return {
        test() {
          const node = new Node();
          const start = performance.now();
          for(let index = 0; index < length; ++index) {
            // const key = hash(`key-${value}`);
            //console.log('add', { k, v : key });
            const handle = set.items.handle(index);
            handle.key = index;
            handle.value = index + 1;
            // console.log('add', node.toJS());
            //set.add(node);
            //set.items.push(node);
            const elapsed = Math.round((performance.now() - start)/1000);
            this.debug(`${index}/${length} ${(index/length).toFixed(2)}% (time=${elapsed})`);
          }
        },
        verify() {
          strictEqual(set.size, length);
          let last = 0;
          for(const item of set) {
            strictEqual(item.key, last++);
            strictEqual(item.value, last);
          }
        }
      }
    }

    function createRandomImplementation(length = 0) {
      // This implementation will be lot more memory efficient
      //  We change the items of the FlatSet to make the test faster
      const set = new Set();
     return {
        test() {
          const node = new Node();
          const start = performance.now();
          for(let index = 0; index < length; ++index) {
            // const key = hash(`key-${value}`);
            //console.log('add', { k, v : key });
            const random = Math.round(Math.random()*length);
            node.key = random;
            node.value = random + 1;
            set.add(node);
            const elapsed = Math.round((performance.now() - start)/1000);
            this.debug(`${index}/${length} ${(index/length).toFixed(2)}% (time=${elapsed})`);
          }
        },
        verify() {
          strictEqual(set.size, length);
          for(const item of set) {
            strictEqual(item.key, item.value - 1);
          }
        }
      }
    }

    function createBadImplementation(length = 0) {
      // This implmenation is in-effective. Used as a comparision
      const map = new Map();
      return {
        test() {
          for(let i = 0; i < length; ++i) {
            map.set(i, { key: i, value: i + 1 });
            this.debug(i, `${i}/${length} ${(i/length).toFixed(2)}`)
          }
        },
        verify() {
          for(let i = 0; i < length; ++i) {
            strictEqual(map.get(i).value, i + 1);
          }
          // map.clear();
        }
      }
    }

  });

});