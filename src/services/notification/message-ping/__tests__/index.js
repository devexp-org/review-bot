import service from '../';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import notificationMock from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';
import { pullRequestReviewMixin } from '../../../pull-request-review/__mocks__/';

describe('services/notification/message-ping', function () {

  let events, logger, notification, payload, pullRequest;
  let options, imports;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();

    notification = notificationMock();

    pullRequest = pullRequestMock(pullRequestReviewMixin);

    payload = { pullRequest };

    events.on.callsArgWith(1, payload);

    options = {};

    imports = { events, logger, notification };

  });

  it('should subscribe to event `review:command:ping`', function () {
    service(options, imports);

    assert.calledWith(events.on, 'review:command:ping');
  });

  it('should send ping message to the author if review status is `changesneeded`', function () {
    pullRequest.user.login = 'Hulk';
    pullRequest.review.status = 'changesneeded';

    service(options, imports);

    assert.alwaysCalledWith(notification.sendMessage, pullRequest, 'Hulk');
  });

  it('should send ping message to the reviewers if review status is `inprogress`', function () {
    pullRequest.review.status = 'inprogress';
    pullRequest.review.reviewers = [
      { login: 'Black Widow' },
      { login: 'Spider-Man' }
    ];

    service(options, imports);

    assert.calledWith(notification.sendMessage, pullRequest, 'Black Widow');
    assert.calledWith(notification.sendMessage, pullRequest, 'Spider-Man');
  });

  it('should not send ping message to approved reviewers', function () {
    pullRequest.review.status = 'inprogress';
    pullRequest.review.reviewers = [
      { login: 'Black Widow' },
      { login: 'Spider-Man', approved: true }
    ];

    service(options, imports);

    assert.alwaysCalledWith(notification.sendMessage, pullRequest, 'Black Widow');
  });

});
