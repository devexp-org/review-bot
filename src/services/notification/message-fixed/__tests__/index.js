import service from '../';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import notificationMock from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';
import { pullRequestReviewMixin } from
  '../../../pull-request-review/__mocks__/';

describe('services/notification/message-fixed', function () {

  let events, logger, notification, payload, pullRequest;
  let options, imports;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();

    notification = notificationMock();

    pullRequest = pullRequestMock();
    pullRequestReviewMixin(pullRequest);

    pullRequest.review.status = 'inprogress';

    payload = { pullRequest };

    events.on
      .withArgs('review:fixed')
      .callsArgWith(1, payload);

    options = {};

    imports = { events, logger, notification };

  });

  it('should subscribe to events', function () {
    service(options, imports);

    assert.calledWith(events.on, 'review:fixed');
  });

  it('should send `fixed` message to the reviewers', function () {
    pullRequest.review.reviewers =
      [{ login: 'Black Widow' }, { login: 'Spider-Man' }];

    service(options, imports);

    assert.calledWith(notification.sendMessage, pullRequest, 'Black Widow');
    assert.calledWith(notification.sendMessage, pullRequest, 'Spider-Man');
  });

  it('should send fixed message only to non-approved reviewers', function () {
    payload.newReviewer = { login: 'Spider-Man' };
    pullRequest.review.reviewers =
      [{ login: 'Black Widow' }, { login: 'Spider-Man', approved: true }];

    service(options, imports);

    assert.alwaysCalledWith(notification.sendMessage, pullRequest, 'Black Widow');
  });

});
