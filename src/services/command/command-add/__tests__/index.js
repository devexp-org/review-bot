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

describe('services/command/add', function () {

  let team, events, logger, payload, pullRequest;
  let teamManager, commandDispatcher, pullRequestReview;
  let options, imports, command, comment;

  beforeEach(function () {

    team = teamMock();
    team.findTeamMember.returns(Promise.resolve({ login: 'Hawkeye' }));

    events = eventsMock();
    logger = loggerMock();

    teamManager = teamManagerMock();
    teamManager.findTeamByPullRequest.returns(Promise.resolve(team));

    commandDispatcher = commandMock();

    pullRequest = pullRequestMock(pullRequestReviewMixin);
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

  it('should return rejected promise if pull request is closed', function (done) {
    pullRequest.state = 'closed';

    command('/add Hulk', payload, ['Hulk'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it('should return rejected promise if user is already a reviewer', function (done) {
    command('/add Hulk', payload, ['Hulk'])
      .then(() => assert.fail())
      .catch(e => assert.match(e.message, /reviewer/))
      .then(done, done);
  });

  it('should return rejected promise if no such user in team', function (done) {
    team.findTeamMember
      .withArgs(pullRequest, 'Batman')
      .returns(Promise.resolve(null));

    command('/add Batman', payload, ['Batman'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /no user/))
      .then(done, done);
  });

  it('should save a pullRequest with new a reviewer', function (done) {
    command('/add Hawkeye', payload, ['Hawkeye'])
      .then(() => {
        assert.called(pullRequestReview.updateReview);

        const actual = pullRequest.get('review.reviewers');
        const expected = reviewersMock();
        expected.push({ login: 'Hawkeye' });

        assert.sameDeepMembers(actual, expected);
      })
      .then(done, done);
  });

  it('should emit `review:command:add` event', function (done) {
    command('/add Hawkeye', payload, ['Hawkeye'])
      .then(() => assert.calledWith(events.emit, 'review:command:add'))
      .then(done, done);
  });

});
