import service from '../update-reviewers';

import loggerMock from '../../../services/logger/__mocks__/index';
import eventsMock from '../../../services/events/__mocks__/index';
import startrekMock from '../__mocks__/index';
import { pullRequestMock } from
  '../../../services/model/collections/__mocks__/pull-request';

describe('plugins/startrek/update-reviewers', function () {

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

    pullRequest.review.status = 'inprogress';
    pullRequest.review.reviewers = [
      { login: 'Spider-Man' }
    ];

    startrek.parseIssue.returns(['TEST-1']);

  });

  it('should update reviewers', function (done) {
    events.on.withArgs('review:start').callsArgWith(1, payload);

    service(options, imports);

    setTimeout(() => {
      assert.calledWith(startrek.issueUpdate, 'TEST-1', { reviewers: ['Spider-Man'] });
      done();
    }, 0);
  });

  it('should not update reviewers if pull request is not `in progress`', function (done) {
    pullRequest.review.status = 'notstarted';

    events.on.withArgs('review:start').callsArgWith(1, payload);

    service(options, imports);

    setTimeout(() => {
      assert.notCalled(startrek.issueUpdate);
      done();
    }, 0);
  });

  it('should not update reviewers if cannot parse issue from pull request title', function (done) {
    startrek.parseIssue.returns([]);

    events.on.withArgs('review:start').callsArgWith(1, payload);

    service(options, imports);

    setTimeout(() => {
      assert.notCalled(startrek.issueUpdate);
      done();
    }, 0);
  });

});
