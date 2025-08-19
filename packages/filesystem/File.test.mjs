import File from './File.mjs';
import { strictEqual } from 'assert';
import Directory from './Directory.mjs';
import withTemporaryDirectory from './withTemporaryDirectory.mjs';

describe('File', function() {

  describe('#getTmpPath', function() {

    it('should support basic usage', function() {
      const path = File.getTmpPath();
      strictEqual(path.includes('/'), true);
      strictEqual(path.endsWith('.tmp'), true);
    });

    it('should be possible to specify extension', function() {
      const path = File.getTmpPath('.blob');
      strictEqual(path.endsWith('.blob'), true);
    });

    it('should be possible to specify last directory scope', function() {
      const path = File.getTmpPath('.tmp', '/a/b/c/d/');
      strictEqual(path.includes('/a/b/c/d/'), true);
    });

  });

  describe('find', function() {

    it('should find files in a directory', function() {
      return withTemporaryDirectory(async baseDir => {
        await Directory.ensure(`${baseDir}/subdir`);
        await File.ensure(`${baseDir}/foo.txt`);
        await File.ensure(`${baseDir}/subdir/bar.txt`);
        const matches = await File.find(baseDir);
        strictEqual(matches.length, 3);
        const files = matches.filter(match => match.type === 'file');
        strictEqual(files.length, 2);
        strictEqual(files[0].path.endsWith('/foo.txt'), true);
        strictEqual(files[1].path.endsWith('/bar.txt'), true);

        const directories = matches.filter(match => match.type === 'directory');
        strictEqual(directories.length, 1);
        strictEqual(directories[0].path.endsWith('/subdir'), true);
      });
    });

  });

});