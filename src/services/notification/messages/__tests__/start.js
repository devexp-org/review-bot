import service from '../start';
import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { pullRequestMock } from '../../../model/pull-request/__mocks__/';

describe('services/notification/start', function () {

  let events, logger, notification, payload, pullRequest;
  let options, imports;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();

    notification = sinon.stub().returns(Promise.resolve());

    pullRequest = pullRequestMock();

    payload = { pullRequest };

    events.on.callsArgWith(1, payload);

    options = {};

    imports = { events, logger, notification };

  });

  it('should subscribe to event `review:started', function () {
    service(options, imports);

    assert.calledWith(events.on, 'review:started');
  });

  it('should send start message to the reviewers', function () {
    pullRequest.review = {
      reviewers: [{ login: 'Black Widow' }, { login: 'Spider-Man' }]
    };

    service(options, imports);

    assert.calledWith(notification, 'Black Widow');
    assert.calledWith(notification, 'Spider-Man');
  });

});
