import service from '../';
import loggerMock from '../../logger/__mocks__/';

describe('services/slack', function () {

  const methods = [
    'connect',
    'close',
    'send'
  ];

  let options, imports, logger;
  beforeEach(function () {
    logger = loggerMock();

    options = { token: 'token' };
    imports = { logger };
  });

  it('should be resolved to Slack', function () {
    const slack = service(options, imports);

    methods.forEach(function (method) {
      assert.property(slack, method);
    });
  });

});
