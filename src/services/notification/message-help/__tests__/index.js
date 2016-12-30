import service from '../';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import notificationMock from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';

describe('services/notification/message-help', function () {

  let events, logger, notification, payload, pullRequest;
  let options, imports;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();

    notification = notificationMock();

    pullRequest = pullRequestMock();

    payload = { pullRequest, comment: { user: { login: 'Black Widow' } } };

    events.on.callsArgWith(1, payload);

    options = {};

    imports = { events, logger, notification };

  });

  it('should subscribe to event `review:command:help', function () {
    service(options, imports);

    assert.calledWith(events.on, 'review:command:help');
  });

  it('should send help message to the author', function () {
    pullRequest.user = { login: 'Black Widow' };

    service(options, imports);

    assert.calledWith(notification.sendMessage, pullRequest, 'Black Widow');
  });

});
