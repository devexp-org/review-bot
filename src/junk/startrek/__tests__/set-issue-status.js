import service from '../set-issue-status';

import loggerMock from '../../../services/logger/__mocks__/index';
import eventsMock from '../../../services/events/__mocks__/index';
import startrekMock from '../__mocks__/index';
import { pullRequestMock } from
  '../../../services/model/collections/__mocks__/pull-request';

describe('plugins/startrek/set-issue-status', function () {

  let options, imports;
  let events, logger, startrek, payload, pullRequest;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();
    startrek = startrekMock();

    pullRequest = pullRequestMock();

    payload = { pullRequest };

    options = {
      queues: ['TEST'],
      events: ['review:start']
    };

    imports = { events, logger, startrek };

    startrek.parseIssue.returns(['TEST-1']);

  });

  it('should update issue status', function (done) {
    events.on.withArgs('review:start').callsArgWith(1, payload);

    service(options, imports);

    setTimeout(() => {
      assert.calledWith(startrek.issueStatusChange, 'TEST-1', 'review');
      done();
    }, 0);
  });

  it('should not update issue status if cannot parse issue from pull request title', function (done) {
    startrek.parseIssue.returns([]);

    events.on.withArgs('review:start').callsArgWith(1, payload);

    service(options, imports);

    setTimeout(() => {
      assert.notCalled(startrek.issueUpdate);
      done();
    }, 0);
  });

});
