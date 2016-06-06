import service from '../help';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { pullRequestMock } from
  '../../../model/pull-request/__mocks__/';

describe('services/command/help', function () {

  let events, logger, pullRequest;
  let options, imports, command, comment, payload;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();

    pullRequest = pullRequestMock();

    comment = { user: { login: 'Black Widow' } };

    payload = { pullRequest, comment };

    options = {};

    imports = { logger, events };

    command = service(options, imports);

  });

  it('should emit review:command:help event', function (done) {

    command('/help', payload)
      .then(() => assert.calledWith(events.emit, 'review:command:help'))
      .then(done, done);

  });

});
