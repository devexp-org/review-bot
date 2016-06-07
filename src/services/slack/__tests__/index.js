import proxyquire from 'proxyquire';

import slackMock from '../__mocks__/';
import loggerMock from '../../logger/__mocks__/';

describe('services/slack', function () {

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

    methods.forEach(method => {
      assert.property(obj, method);
    });

  });

  it('should try connect to jabber', function () {
    service(options, imports);

    assert.called(slack.connect);
  });

  it('should close connection when shutdown', function () {
    const callback = sinon.stub();
    const slackService = service(options, imports);

    slackService.close.callsArg(0);
    slackService.shutdown(callback);

    assert.called(slack.close);
  });

});
