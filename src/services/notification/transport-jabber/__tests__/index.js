import proxyquire from 'proxyquire';
import jabberMock from '../__mocks__/';
import loggerMock from '../../../logger/__mocks__/';

describe('services/notification/transport-jabber', function () {

  let options, imports;
  let service, logger, jabber;

  beforeEach(function () {
    logger = loggerMock();
    jabber = jabberMock();

    options = {};
    imports = { logger };

    service = proxyquire('../', {
      './class': { 'default': jabber }
    }).default;

  });

  it('the mock object should have the same methods', function () {
    const obj = service(options, imports);
    const methods = Object.keys(obj);

    methods.forEach(method => assert.property(obj, method));
  });

  it('should close connection when shutdown', function (done) {
    const jabberService = service(options, imports);

    jabberService
      .shutdown()
      .then(() => assert.called(jabber.close))
      .then(done, done);
  });

});
