import service from '../../mongoose';

describe('service/mongoose', function () {

  let options, imports;

  beforeEach(function () {
    options = { host: 'localhost' };

    imports = {
      logger: {
        info: sinon.stub(),
        error: sinon.stub()
      }
    };
  });

  it('should be resolved to Mongoose', function (done) {

    service(options, imports)
      .then(result => {
        const mongoose = result.service;
        assert.property(mongoose, 'model');

        result.shutdown().then(done);
      })
      .catch(done);

  });

  it('should be rejected on error', function (done) {
    options.host = 'undefined';

    service(options, imports)
      .then(done)
      .catch(e => {
        assert.instanceOf(e, Error);
        done();
      });

  });

});
