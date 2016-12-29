import service from '../';

import commandMock from '../../__mocks__/';
import teamManagerMock from '../../../team-manager/__mocks__/class';
import { teamDriverMock } from '../../../team-manager/__mocks__/';
import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { reviewersMock } from '../../__mocks__/';
import { pullRequestMock } from
  '../../../model/model-pull-request/__mocks__/';
import pullRequestReviewMock, { pullRequestReviewMixin } from
  '../../../pull-request-review/__mocks__/';

describe('services/command/not_ok', function () {

  let team, events, logger, teamManager, pullRequest, pullRequestReview;
  let options, imports, command, comment, payload, commandDispatcher;

  beforeEach(function () {

    team = teamDriverMock();
    team.findTeamMember.returns(Promise.resolve({ login: 'Hawkeye' }));

    events = eventsMock();
    logger = loggerMock();

    teamManager = teamManagerMock();
    teamManager.findTeamByPullRequest.returns(Promise.resolve(team));

    commandDispatcher = commandMock();

    pullRequest = pullRequestMock(pullRequestReviewMixin);
    pullRequest.user.login = 'Black Widow';
    pullRequest.review.reviewers = reviewersMock();

    pullRequestReview = pullRequestReviewMock(pullRequest);

    comment = { user: { login: 'Hulk' } };

    payload = { pullRequest, comment };

    options = {};

    imports = {
      events,
      logger,
      command: commandDispatcher,
      'team-manager': teamManager,
      'pull-request-review': pullRequestReview
    };

    command = service(options, imports);

  });

  it('should return rejected promise if pull request is closed', done => {
    pullRequest.state = 'closed';

    command('/!ok', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it('should return rejected promise if author is not in reviewer', function (done) {
    payload.comment.user.login = 'Spider-Man';

    command('/!ok', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /reviewer/))
      .then(done, done);
  });

  it('should emit `review:command:not_ok` event', function (done) {
    command('/!ok', payload)
      .then(() => assert.calledWith(events.emit, 'review:command:not_ok'))
      .then(done, done);
  });

  it('should change status from `complete` to `changesneeded`', function (done) {
    pullRequest.review.status = 'complete';

    command('/!ok', payload)
      .then(() => assert.called(pullRequestReview.changesNeeded))
      .then(done, done);
  });

});
