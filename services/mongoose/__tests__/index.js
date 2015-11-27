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
