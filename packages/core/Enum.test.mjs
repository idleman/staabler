import getPackageName from './getPackageName.mjs';
import Enum from './Enum.mjs';
import { throws, strictEqual } from 'assert';

describe(getPackageName(import.meta.url), function() {

  const getStatusType = () => Enum('Status', ['open', 'closed']);

  describe('#constructor', function() {
    
    it(`should throw an error`, function() {
      const Status = getStatusType();
      throws(() => new Status());
    });

    it(`should define the values`, function() {
      const Status = getStatusType();
      strictEqual(Status.open, 'open');
      strictEqual(Status.closed, 'closed');
    });
    
  });

  describe('#from', function() {
    
    it(`should be a static method`, function() {
      const Status = getStatusType();
      strictEqual(typeof Status.from, 'function');
      const status = Status.from('open');
      strictEqual(status, 'open');
    });

    it(`should throw if not a valid value`, function() {
      const Status = getStatusType();
      throws(() => Status.from('Yeah'));
    });
    
  });

});