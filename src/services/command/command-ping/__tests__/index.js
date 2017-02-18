import service from '../';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { reviewersMock } from '../../__mocks__/';
import { teamDriverMock } from
  '../../../team-manager/__mocks__/';
import { pullRequestMock } from
  '../../../model/model-pull-request/__mocks__/';
import { pullRequestReviewMixin } from
  '../../../pull-request-review/__mocks__/';

describe('services/command/ping', function () {

  let team, events, logger, pullRequest;
  let options, imports, command, comment, payload;

  beforeEach(function () {

    team = teamDriverMock();

    events = eventsMock();
    logger = loggerMock();

    pullRequest = pullRequestMock(pullRequestReviewMixin);
    pullRequest.user.login = 'Black Widow';
    pullRequest.review.reviewers = reviewersMock();

    comment = { user: { login: 'Black Widow' } };

    payload = { pullRequest, comment, team };

    options = {};

    imports = { logger, events };

    command = service(options, imports).command;

  });

  it('should return rejected promise if pull request is closed', function (done) {
    payload.pullRequest.state = 'closed';

    command('/ping', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it('should return rejected promise if commenter is not an author', function (done) {
    pullRequest.user.login = 'Spider-Man';

    command('/ping', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /author/i))
      .then(done, done);
  });

  it('should return resolved promise if commenter is not an author but config allows it', function (done) {
    pullRequest.user.login = 'Spider-Man';
    team.getOption.withArgs('pingReviewByAnyone').returns(true);

    command('/ping', payload)
      .then(() => {})
      .then(done, done);
  });

  it('should emit review:command:ping event', function (done) {
    command('/ping', payload)
      .then(() => assert.calledWith(events.emit, 'review:command:ping'))
      .then(done, done);
  });

});
