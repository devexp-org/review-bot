import service from '../';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import reviewMock from '../../../review/__mocks__/';
import { reviewersMock } from '../../__mocks__/';
import { pullRequestMock } from
  '../../../model/model-pull-request/__mocks__/';
import teamManagerMock, { teamDriverMock } from
  '../../../team-manager/__mocks__/';
import pullRequestReviewMock, { pullRequestReviewMixin } from
  '../../../pull-request-review/__mocks__/';

describe('services/command/replace', function () {

  let team, events, logger, review, teamManager, pullRequest, pullRequestReview;
  let options, imports, command, comment, payload;

  beforeEach(function () {

    team = teamDriverMock();
    team.findTeamMember.returns(Promise.resolve({ login: 'Hawkeye' }));

    events = eventsMock();
    logger = loggerMock();
    review = reviewMock();

    review.choose.returns(Promise.resolve({
      reviewers: [{ login: 'Spider-Man' }], pullRequest
    }));

    teamManager = teamManagerMock(team);

    pullRequest = pullRequestMock(pullRequestReviewMixin);
    pullRequest.user.login = 'Black Widow';
    pullRequest.review.reviewers = reviewersMock();

    pullRequestReview = pullRequestReviewMock(pullRequest);

    comment = { user: { login: 'Black Widow' } };

    payload = { pullRequest, comment, team };

    options = {};

    imports = {
      events,
      logger,
      review,
      'team-manager': teamManager,
      'pull-request-review': pullRequestReview
    };

    command = service(options, imports).command;

  });

  it('should return rejected promise if pull request is closed', function (done) {
    pullRequest.state = 'closed';

    command('/replace Hulk', payload, ['Hulk'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it('should return rejected promise if commenter is not an author', function (done) {
    pullRequest.user.login = 'Spider-Man';

    command('/replace Hulk', payload, ['Hulk'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /author/i))
      .then(done, done);
  });

  it('should return resolved promise if commenter is not an author but config allows it', function (done) {
    pullRequest.user.login = 'Spider-Man';
    team.getOption.withArgs('changeReviewerByAnyone').returns(true);

    command('/replace Hulk', payload, ['Hulk'])
      .then(() => {})
      .then(done, done);
  });

  it('should rejected promise if old reviewer not in reviewers list', function (done) {
    command('/replace Spider-Man', payload, ['Spider-Man'])
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /is not a reviewer/i))
      .then(done, done);
  });

  it('should not reject promise if no reviewers at all', function (done) {
    review.choose.returns(Promise.resolve({
      reviewers: [], pullRequest
    }));

    command('/replace Hulk', payload, ['Hulk'])
      .then(() => {})
      .then(done, done);
  });

  it('should save pull request with a new reviewer', function (done) {
    command('/replace Hulk', payload, ['Hulk'])
      .then(() => {
        assert.calledWith(
          pullRequestReview.updateReview,
          sinon.match.object,
          sinon.match(review => {
            assert.sameDeepMembers(
              review.reviewers, [{ login: 'Spider-Man' }, { login: 'Thor' }]
            );

            return true;
          })
        );
      })
      .then(done, done);
  });

  it('should emit `review:command:replace` event', function (done) {
    command('/replace Hulk', payload, ['Hulk'])
      .then(() => assert.calledWith(events.emit, 'review:command:replace'))
      .then(done, done);
  });

});
