import proxyquire from 'proxyquire';

import slackMock from '../__mocks__/';
import loggerMock from '../../../logger/__mocks__/';

describe('services/notification/transport-slack', function () {

  let options, imports;
  let service, logger, slack;

  beforeEach(function () {
    slack = slackMock();
    logger = loggerMock();

    options = { token: 'token' };
    imports = { logger };

    service = proxyquire('../', {
      './class': { 'default': slack }
    }).default;

  });

  it('the mock object should have the same methods', function () {
    const obj = service(options, imports);
    const methods = Object.keys(slack);

    methods.forEach(method => assert.property(obj, method));
  });

  it('should close connection when shutdown', function (done) {
    const slackService = service(options, imports);

    slackService
      .shutdown()
      .then(() => assert.called(slack.close))
      .then(done, done);
  });

});
