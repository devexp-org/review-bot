import proxyquire from 'proxyquire';
import jabberMock from '../__mocks__/';
import loggerMock from '../../logger/__mocks__/';

describe('services/jabber', function () {

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
    const methods = Object.keys(jabber);

    methods.forEach(method => {
      assert.property(obj, method);
    });

  });

  it('should try connect to jabber', function () {
    service(options, imports);

    assert.called(jabber.connect);
  });

  it('should close connection when shutdown', function () {
    const callback = sinon.stub();
    const jabberService = service(options, imports);

    jabberService.close.callsArg(0);
    jabberService.shutdown(callback);

    assert.called(jabber.close);
  });

});
