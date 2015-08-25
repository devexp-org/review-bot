import service from '../../logger';
import { Writable } from 'stream';

class MyDummyWritableStream extends Writable {

  _write(chunk, encoding, callback) {
    callback();
  }

}

describe('service/logger', function () {

  it('should be resolved to logger', function (done) {

    const options = {
      transports: []
    };

    service(options)
      .then(result => {
        const logger = result.service;

        assert.property(logger, 'info');
        assert.property(logger, 'warn');
        assert.property(logger, 'error');

        done();
      })
      .catch(done);

  });

  describe('#options', function () {

    it('should accept `file` and `console` transports', function (done) {

      const options = {
        transports: [
          {
            name: 'file',
            stream: new MyDummyWritableStream()
          },
          {
            name: 'daily-rotate-file',
            stream: new MyDummyWritableStream()
          },
          {
            name: 'console',
            timestamp: true
          }
        ]
      };

      service(options)
        .then(result => { done(); })
        .catch(done);

    });

    it('should throw an error if unknown transport passed', function () {
      const options = {
        transports: [{ name: 'black-hole' }]
      };

      const run = function () {
        return service(options);
      };

      assert.throws(run, /black\-hole/);
    });

  });


});
