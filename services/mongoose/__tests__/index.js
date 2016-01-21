import service from '../../mongoose';
import loggerMock from '../../logger/__mocks__/index';

describe('services/mongoose', function () {

  let options, imports;

  beforeEach(function () {
    options = { host: 'localhost' };

    imports = {
      logger: loggerMock()
    };
  });

  it.skip('should be resolved to mongoose', function (done) {

    service(options, imports)
      .then(mongoose => {
        assert.property(mongoose, 'model');
        mongoose.shutdown(done);
      })
      .catch(done);

  });

  it.skip('should be rejected on error', function (done) {
    options.host = 'undefined';

    service(options, imports)
      .then(done)
      .catch(e => {
        assert.equal(e.name, 'MongoError');
        done();
      })
      .catch(done);

  });

});
