import service from '../';

import teamMock from '../../../team-manager/__mocks__/driver';
import commandMock from '../../__mocks__/';
import teamManagerMock from '../../../team-manager/__mocks__/class';
import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { reviewersMock } from '../../__mocks__/';
import { pullRequestMock } from
  '../../../model/model-pull-request/__mocks__/';
import pullRequestReviewMock, { pullRequestReviewMixin } from
  '../../../pull-request-review/__mocks__/';

describe('services/command/change', function () {

  let team, events, logger, teamManager, pullRequest, pullRequestReview;
  let options, imports, command, comment, payload, commandDispatcher;

  beforeEach(function () {

    team = teamMock();
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

    comment = { user: { login: 'Black Widow' } };

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

    command('/change Hulk to Hawkeye', payload, ['Hulk', 'Hawkeye'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it('should return rejected promise if participants could not be parsed', function (done) {
    command('/change Hulk', payload, ['Hulk'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /cannot parse/i))
      .then(done, done);
  });

  it('should return rejected promise if commenter is not an author', function (done) {
    pullRequest.user.login = 'Spider-Man';

    command('/change Hulk to Hawkeye', payload, ['Hulk', 'Hawkeye'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /author/i))
      .then(done, done);
  });

  it('should rejected promise if old reviewer not in reviewers list', function (done) {
    command('/change Spider-Man to Hawkeye', payload, ['Spider-Man', 'Hawkeye'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /is not a reviewer/i))
      .then(done, done);
  });

  it('should return rejected promise if new reviewer is already in reviewers list', function (done) {
    command('/change Thor to Hulk', payload, ['Thor', 'Hulk'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /already a reviewer/i))
      .then(done, done);
  });

  it('should return rejected promise if author tries to set himself as reviewer', function (done) {
    command('/change Thor to Black Widow', payload, ['Thor', 'Black Widow'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /author/i))
      .then(done, done);
  });

  it('should return rejected promise if a new reviewer is not in team', function (done) {
    team.findTeamMember.returns(Promise.resolve(null));

    command('/change Thor to Batman', payload, ['Thor', 'Batman'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /no user/i))
      .then(done, done);

  });

  it('should save pullRequest with a new reviewer', function (done) {
    team.findTeamMember
      .withArgs(pullRequest, 'Spider-Man')
      .returns(Promise.resolve({ login: 'Spider-Man' }));

    command('/change Thor to Spider-Man', payload, ['Thor', 'Spider-Man'])
      .then(() => {
        assert.calledWith(
          pullRequestReview.updateReview,
          sinon.match.object,
          sinon.match(review => {
            assert.sameDeepMembers(
              review.reviewers, [{ login: 'Hulk' }, { login: 'Spider-Man' }]
            );

            return true;
          })
        );
      })
      .then(done, done);
  });

});
