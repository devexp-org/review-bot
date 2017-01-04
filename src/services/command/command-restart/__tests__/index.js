import service from '../';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { reviewersMock } from '../../__mocks__/';
import { pullRequestMock } from
  '../../../model/model-pull-request/__mocks__/';
import teamManagerMock, { teamDriverMock } from
  '../../../team-manager/__mocks__/';
import pullRequestReviewMock, { pullRequestReviewMixin } from
  '../../../pull-request-review/__mocks__/';

describe('services/command/restart', function () {

  let team, events, logger, teamManager, pullRequest, pullRequestReview;
  let options, imports, command, comment, payload;

  beforeEach(function () {

    team = teamDriverMock();
    team.findTeamMember
      .returns(Promise.resolve({ login: 'Hawkeye' }));

    events = eventsMock();
    logger = loggerMock();

    teamManager = teamManagerMock(team);

    pullRequest = pullRequestMock(pullRequestReviewMixin);
    pullRequest.user.login = 'Black Widow';
    pullRequest.review.status = 'inprogress';
    pullRequest.review.reviewers = reviewersMock();

    pullRequestReview = pullRequestReviewMock(pullRequest);

    comment = { user: { login: 'Black Widow' } };

    payload = { pullRequest, comment };

    options = {};

    imports = {
      events,
      logger,
      'team-manager': teamManager,
      'pull-request-review': pullRequestReview
    };

    command = service(options, imports).command;

  });

  it('should return rejected promise if pull request is closed', function (done) {
    pullRequest.state = 'closed';

    command('/restart', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it.skip('should return rejected promise if triggered by not an author', function (done) {
    comment.user.login = 'Spider-Man';

    command('/restart', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /author/))
      .then(done, done);
  });

  it('should emit review:command:restart event', function (done) {
    command('/restart', payload)
      .then(() => assert.calledWith(events.emit, 'review:command:restart'))
      .then(done, done);
  });

});
