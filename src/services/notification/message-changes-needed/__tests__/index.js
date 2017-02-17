import service from '../';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import notificationMock from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';
import { pullRequestReviewMixin } from
  '../../../pull-request-review/__mocks__/';

describe('services/notification/message-changes-needed', function () {

  let events, logger, notification, payload, pullRequest;
  let options, imports;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();

    notification = notificationMock();

    pullRequest = pullRequestMock();
    pullRequestReviewMixin(pullRequest);

    payload = { pullRequest };

    events.on
      .withArgs('review:changesneeded')
      .callsArgWith(1, payload);

    options = {};

    imports = { events, logger, notification };

  });

  it('should subscribe to events', function () {
    service(options, imports);

    assert.calledWith(events.on, 'review:changesneeded');
  });

  it('should send `changes needed` message to author of pull request', function () {
    pullRequest.user.login = 'Black Widow';

    service(options, imports);

    assert.alwaysCalledWith(notification.sendMessage, pullRequest, 'Black Widow');
  });

});
