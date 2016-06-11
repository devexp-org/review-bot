import service from '../remove';

import teamMock from '../../../team-dispatcher/__mocks__/team';
import teamDispatcherMock from '../../../team-dispatcher/__mocks__/class';
import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { reviewersMock } from '../../__mocks__/';
import { pullRequestMock } from
  '../../../model/pull-request/__mocks__/';
import pullRequestReviewMock from
  '../../../pull-request-review/__mocks__/';

describe('services/command/remove', function () {

  let team, events, logger, teamDispatcher, pullRequest, pullRequestReview;
  let options, imports, command, comment, payload;

  beforeEach(function () {

    team = teamMock();
    team.findTeamMember.returns(Promise.resolve({ login: 'Hawkeye' }));

    events = eventsMock();
    logger = loggerMock();

    teamDispatcher = teamDispatcherMock();
    teamDispatcher.findTeamByPullRequest.returns(Promise.resolve(team));

    pullRequest = pullRequestMock();
    pullRequest.user.login = 'Black Widow';
    pullRequest.review.reviewers = reviewersMock();

    pullRequestReview = pullRequestReviewMock(pullRequest);

    comment = { user: { login: 'Black Widow' } };

    payload = { pullRequest, comment };

    options = {};

    imports = {
      events,
      logger,
      'team-dispatcher': teamDispatcher,
      'pull-request-review': pullRequestReview
    };

    command = service(options, imports);

  });

  it('should return rejected promise if pull request is closed', function (done) {
    pullRequest.state = 'closed';

    command('/remove Hulk', payload, ['Hulk'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it('should return rejected promise if user is not a reviewer', function (done) {
    command('/remove Spider-Man', payload, ['Spider-Man'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /reviewer/))
      .then(done, done);
  });

  it('should return rejected promise if there is only 1 reviewer', function (done) {
    pullRequest.review.reviewers.splice(1, 1);

    command('/remove Hulk', payload, ['Hulk'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /at least/))
      .then(done, done);
  });

  it('should save pullRequest without reviewer', function (done) {
    command('/remove Hulk', payload, ['Hulk'])
      .then(() => {
        assert.calledWith(
          pullRequestReview.updateReview,
          sinon.match.object,
          sinon.match(review => {
            assert.sameDeepMembers(review.reviewers, [{ login: 'Thor' }]);

            return true;
          })
        );
      })
      .then(done, done);
  });

  it('should emit `review:command:remove` event', function (done) {
    command('/remove Hulk', payload, ['Hulk'])
      .then(() => assert.calledWith(events.emit, 'review:command:remove'))
      .then(done, done);
  });

});
