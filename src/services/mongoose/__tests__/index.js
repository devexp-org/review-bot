import proxyquire from 'proxyquire';
import loggerMock from '../../logger/__mocks__/';

describe('services/mongoose', function () {

  let options, imports, mongoose, connectionStub;

  beforeEach(function () {
    options = { host: 'localhost' };

    imports = {
      logger: loggerMock()
    };

    connectionStub = {
      once: sinon.stub().returnsThis(),
      close: sinon.stub()
    };

    mongoose = proxyquire('../', {
      mongoose: {
        createConnection: sinon.stub().returns(connectionStub)
      }
    }).default;

  });

  it('should be resolved when connection is opened', function (done) {
    connectionStub.once
      .withArgs('open')
      .callsArg(1);

    mongoose(options, imports)
      .then(result => assert.equal(result, connectionStub))
      .then(done, done);
  });

  it('should be rejected when connection is failed', function (done) {
    connectionStub.once
      .withArgs('error')
      .callsArgWith(1, new Error('MyError'));

    mongoose(options, imports)
      .then(() => assert.fail())
      .catch(e => assert.match(e.message, /MyError/))
      .then(done, done);
  });

  it('should able to shutdown gracefully', function (done) {
    connectionStub.once.withArgs('open').callsArg(1);
    connectionStub.close.callsArg(0);

    mongoose(options, imports)
      .then(mongoose => new Promise(resolve => mongoose.shutdown(resolve)))
      .then(() => assert.called(connectionStub.close))
      .then(done, done);
  });

});
