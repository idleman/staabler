import getPackageName from './getPackageName.mjs';
import { strictEqual } from 'node:assert';
import EventEmitter from './EventEmitter.mjs';

describe(getPackageName(import.meta.url), function() {

  describe('#constructor', function() {

    it('should be constructible', function() {
      const obj = new EventEmitter();
      strictEqual(obj instanceof EventEmitter, true);
    });

  });

  describe('#subscribe+publish', function() {

    it('should work as expected', function() {
      const obj = new EventEmitter();
      const logs = [];

      const unsubscribe1 = obj.subscribe((...args) => logs.push(['first'].concat(args)));
      const unsubscribe2 = obj.subscribe((...args) => logs.push(['second'].concat(args)));

      obj.publish('1', 2);
      unsubscribe1();
      obj.publish('3');
      unsubscribe2();
      obj.publish('4');
      strictEqual(logs.length, 3);
      strictEqual(logs[0].join(), 'first,1,2');
      strictEqual(logs[1].join(), 'second,1,2');
      strictEqual(logs[2].join(), 'second,3');
    });

  });

});