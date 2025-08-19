import getPackageName from '@staabler/core/getPackageName.mjs';
import File from './File.mjs';
import Config from './Config.mjs';
import { readFileSync } from 'node:fs';
import { strictEqual } from 'node:assert';

describe(getPackageName(import.meta.url), function() {
  
  describe('parse', function() {
    
    it('should parse basic key-value pairs', function() {
      const config = Config.parse('port=8080\naddress=127.0.0.1\n');
      strictEqual(config.port, 8080);
      strictEqual(config.address, '127.0.0.1');
    });

    it('should handle boolean values', function() {
      const config = Config.parse('enabled=true\ndisabled=false\nempty=\n');
      strictEqual(config.enabled, true);
      strictEqual(config.disabled, false);
      strictEqual(config.empty, true);
    });

    it('should handle numeric values', function() {
      const config = Config.parse('int=42\nfloat=3.14\n');
      strictEqual(config.int, 42);
      strictEqual(config.float, 3.14);
    });

    it('should ignore comments and empty lines', function() {
      const config = Config.parse('# This is a comment\n#comment=123\nport=8080\n# Another comment\n');
      strictEqual(config.port, 8080);
      strictEqual(Object.keys(config).length, 1);
    });

  });

  describe('constructor and instance methods', function() {
    
    it('should create empty config by default', function() {
      const config = new Config();
      strictEqual(config.options.size, 0);
    });

    it('should load options from object', function() {
      const config = new Config({ port: 8080, address: '127.0.0.1' });
      strictEqual(config.get('port'), 8080);
      strictEqual(config.get('address'), '127.0.0.1');
    });

    it('should load options from string', function() {
      const config = new Config('port=8080\naddress=127.0.0.1\n');
      strictEqual(config.get('port'), 8080);
      strictEqual(config.get('address'), '127.0.0.1');
    });

    it('should reset options', function() {
      const config = new Config({ port: 8080 });
      config.reset();
      strictEqual(config.options.size, 0);
    });

    it('should get value with default', function() {
      const config = new Config();
      strictEqual(config.get('nonexistent', 'default'), 'default');
    });

    it('should set and get values', function() {
      const config = new Config();
      config.set('port', 8080);
      strictEqual(config.get('port'), 8080);
    });

    it('should convert to string', function() {
      const config = new Config({ port: 8080, address: '127.0.0.1' });
      const expected = 'port=8080\naddress=127.0.0.1';
      strictEqual(config.toString(), expected);
    });

    
  });

  describe('file operations', function() {
    
    it('should load from file', function() {
      return File.withTmpFile(async src => {
        const file = File.construct(src, 'a+');
        file.writeSync('port=8080\naddress=127.0.0.1\n');

        const config = new Config();
        config.loadFromFile(src);
        strictEqual(config.get('port'), 8080);
        strictEqual(config.get('address'), '127.0.0.1');
      });
    });

    it('should save to file', function() {
      return File.withTmpFile(async src => {
        const config = new Config({ port: 8080, address: '127.0.0.1' });
        config.saveToFile(src);

        const content = readFileSync(src, 'utf8');
        strictEqual(content, 'port=8080\naddress=127.0.0.1');
      });
    });

    it('should save values with whitspace', function() {
      return File.withTmpFile(async src => {
        const config1 = new Config({ port: 8080, address: '127.0.0.1', 'whitespace key': 'value with whitespace' });
        config1.saveToFile(src);

        const config2 = new Config();
        config2.loadFromFile(src);
        strictEqual(config2.get('whitespace key'), 'value with whitespace');
      });
    });
  });
});