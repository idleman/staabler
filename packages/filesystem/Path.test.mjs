import Path from './Path.mjs';
import { strictEqual } from 'node:assert';

describe('Path', function() {
  
  describe('normalize', function() {

    const tests = [
      
      { args: ['\\Users\\John\\Desktop'], expected: '/Users/John/Desktop' },
      { args: ['//Users//John//Desktop'], expected: '/Users/John/Desktop' },
      { args: ['///Users//John//Desktop'], expected: '/Users/John/Desktop' },
      { args: ['\\Users\\John\\file.txt'], expected: '/Users/John/file.txt' },
      { args: ['Users/John/Desktop/./file.txt'], expected: 'Users/John/Desktop/file.txt' },
      { args: ['Users/John/Desktop/../file.txt'], expected: 'Users/John/file.txt' },
      { args: ['Users/John/Desktop/../../file.txt'], expected: 'Users/file.txt' },
      { args: ['Users/John/Desktop/../.././../../file.txt'], expected: 'file.txt' },
      { args: ['/a', 'b'], expected: '/a/b' },
      { args: ['/a', '/b'], expected: '/b' },
      { args: ['C:/a', '/b'], expected: 'C:/b' },
      { args: ['/foo', 'bar', 'baz/asdf', 'quux', '..'], expected: '/foo/bar/baz/asdf' },
      { args: ['./Users/./test/../foo'], expected: './Users/foo' }
    ];


    it('should normalize a path', function() {
      for(const { args, expected } of tests) {
        strictEqual(Path.normalize(...args), expected);
      }
    });

  });

  describe('toURL', function() {

    const tests = [
      ['/Users/John/hello world.txt', 'file:///Users/John/hello%20world.txt'],
      ['/home/alice/project/readme.md', 'file:///home/alice/project/readme.md'],
      ['C:\\Users\\John\\Desktop\\file.txt', 'file:///C:/Users/John/Desktop/file.txt']
    ];

    it('should convert file path to URL', function() {
      for(const [input, expect] of tests) {
        const got = Path.toURL(input);
        strictEqual(got, expect);
      }
    });

  });

  describe('toPath', function() {

    const tests = [
      ['file:///Users/John/hello%20world.txt', '/Users/John/hello world.txt'],
      [ 'file:///home/alice/project/readme.md', '/home/alice/project/readme.md'],
      ['file:///C:/Users/John/Desktop/file.txt', 'C:/Users/John/Desktop/file.txt'],
      ['file:///C:/Users/John/Desktop/hello%20world.txt', 'C:/Users/John/Desktop/hello world.txt']
    ];

    it('should convert file path to URL', function() {
      for(const [input, expect] of tests) {
        const got = Path.toPath(input);
        strictEqual(got, expect);
      }
    });

  });


  // describe('resolve', function() {

  //   const tests = [
  //     { args: ['C:/Users/John', './dist/index.js'], expect: 'C:/Users/John/dist/index.js' },
  //     // ['/home/alice/project/readme.md', 'file:///home/alice/project/readme.md'],
  //     // ['C:\\Users\\John\\Desktop\\file.txt', 'file:///C:/Users/John/Desktop/file.txt']
  //   ];

  //   it('should convert file path to URL', function() {
  //     for(const { args, expect } of tests) {
  //       const got = Path.resolve(...args);
  //       strictEqual(got, expect);
  //     }
  //   });

  // });
  
});