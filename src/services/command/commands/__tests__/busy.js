import service from '../busy';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import reviewMock from '../../../review/__mocks__/';
import { reviewersMock } from '../../__mocks__/';
import { pullRequestMock } from
  '../../../model/pull-request/__mocks__/';
import pullRequestReviewMock from
  '../../../pull-request-review/__mocks__/';

describe('services/command/busy', function () {

  let events, logger, review, pullRequest, pullRequestReview;
  let options, imports, command, comment, payload;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();
    review = reviewMock();

    review.choose.returns(Promise.resolve({
      ranks: [{ login: 'Black Widow' }], pullRequest
    }));

    pullRequest = pullRequestMock();
    pullRequest.review.reviewers = reviewersMock();

    pullRequestReview = pullRequestReviewMock(pullRequest);

    comment = { user: { login: 'Thor' } };

    payload = { pullRequest, comment };

    options = {};

    imports = {
      events,
      logger,
      review,
      'pull-request-review': pullRequestReview
    };

    command = service(options, imports);

  });

  it('should return rejected promise if pull request is closed', done => {
    pullRequest.state = 'closed';

    command('/busy', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it('should return rejected promise if author is not a reviewer', function (done) {
    payload.comment.user.login = 'Black Widow';

    command('/busy', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /reviewer/))
      .then(done, done);
  });

  it('should save pull request with a new reviewer', function (done) {
    command('/busy', payload)
      .then(() => {
        assert.calledWith(
          pullRequestReview.updateReview,
          sinon.match.object,
          sinon.match(review => {
            assert.sameDeepMembers(
              review.reviewers, [{ login: 'Black Widow' }, { login: 'Hulk' }]
            );

            return true;
          })
        );
      })
      .then(done, done);
  });

  it('should emit `review:command:busy` event', function (done) {
    command('/busy', payload)
      .then(() => assert.calledWith(events.emit, 'review:command:busy'))
      .then(done, done);
  });

});
