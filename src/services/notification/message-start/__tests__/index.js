import service from '../';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import notificationMock from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';

describe('services/notification/message-start', function () {

  let events, logger, notification, payload, pullRequest;
  let options, imports;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();

    notification = notificationMock();

    pullRequest = pullRequestMock();

    payload = { pullRequest };

    events.on
      .withArgs('review:started')
      .callsArgWith(1, payload);

    options = {};

    imports = { events, logger, notification };

  });

  it('should subscribe to events', function () {
    service(options, imports);

    assert.calledWith(events.on, 'review:started');
    assert.calledWith(events.on, 'review:command:add');
    assert.calledWith(events.on, 'review:command:busy');
    assert.calledWith(events.on, 'review:command:change');
    assert.calledWith(events.on, 'review:command:replace');
  });

  it('should send start message to the reviewers', function () {
    pullRequest.review = {
      reviewers: [{ login: 'Black Widow' }, { login: 'Spider-Man' }]
    };

    service(options, imports);

    assert.calledWith(notification.sendMessage, pullRequest, 'Black Widow');
    assert.calledWith(notification.sendMessage, pullRequest, 'Spider-Man');
  });

  it('should send start message only to new reviewers', function () {
    payload.newReviewer = { login: 'Spider-Man' };

    pullRequest.review = {
      reviewers: [{ login: 'Black Widow' }, { login: 'Spider-Man' }]
    };

    service(options, imports);

    assert.calledOnce(notification.sendMessage);
    assert.calledWith(notification.sendMessage, pullRequest, 'Spider-Man');
    assert.neverCalledWith(notification.sendMessage, pullRequest, 'Black Widow');
  });

});
