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

describe('services/command/ok', function () {

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
    pullRequest.review.reviewers = reviewersMock();

    pullRequestReview = pullRequestReviewMock(pullRequest);

    comment = { user: { login: 'Hulk' } };

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

    command('/ok', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it('should return rejected promise if author tried to `ok` to himself', function (done) {
    comment.user.login = 'Black Widow';

    command('/ok', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /himself/))
      .then(done, done);
  });

  it('should return rejected promise if there is no such user in team', function (done) {
    comment.user.login = 'Spider-Man';

    team.findTeamMember
      .withArgs('Spider-Man')
      .returns(Promise.resolve(null));

    command('/ok', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /no user/i))
      .then(done, done);
  });

  it('should add a new reviewer to pull request', function (done) {
    comment.user.login = 'Spider-Man';

    team.findTeamMember
      .withArgs('Spider-Man')
      .returns(Promise.resolve({ login: 'Spider-Man' }));

    command('/ok', payload)
      .then(pullRequest => {
        assert.calledWith(
          pullRequestReview.updateReview,
          sinon.match.object,
          sinon.match(review => {
            assert.sameDeepMembers(
              review.reviewers,
              [
                { login: 'Hulk' },
                { login: 'Thor' },
                { login: 'Spider-Man' }
              ]
            );

            return true;
          })
        );
      })
      .then(done, done);
  });

  it('should emit review:command:ok event', function (done) {
    command('/ok', payload)
      .then(pullRequest => assert.calledWith(events.emit, 'review:command:ok'))
      .then(done, done);
  });
});
