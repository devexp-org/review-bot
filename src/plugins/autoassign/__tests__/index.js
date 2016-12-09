import service from '../index';
import eventsMock from '../../../services/events/__mocks__/';
import loggerMock from '../../../services/logger/__mocks__/';
import reviewMock from '../../../services/review/__mocks__/';
import { pullRequestMock } from
  '../../../services/model/model-pull-request/__mocks__/';
import pullRequestReviewMock from
  '../../../services/pull-request-review/__mocks__/';

describe('plugins/autoassign', function () {

  let events, logger, review, payload, options, imports;
  let pullRequest, pullRequestReview, reviewResult;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();
    review = reviewMock();

    pullRequest = pullRequestMock();

    pullRequestReview = pullRequestReviewMock(pullRequest);

    options = {};

    imports = {
      events,
      logger,
      review,
      'pull-request-review': pullRequestReview
    };

    payload = { pullRequest };

    reviewResult = {};

    events.on
      .withArgs('github:pull_request:opened')
      .callsArgWith(1, payload);

    review.choose
      .withArgs(pullRequest)
      .returns(Promise.resolve(reviewResult));

    pullRequest.hasReviewers.returns(false);

  });

  it('should assign reviewers when someone open a new pull request', function (done) {
    service(options, imports);

    setTimeout(() => {
      assert.calledWithExactly(
        pullRequestReview.updateReview,
        pullRequest,
        reviewResult
      );
      done();
    }, 0);
  });

  it('should not reassign reviewers if reviewers were selected before', function (done) {
    pullRequest.hasReviewers.returns(true);

    service(options, imports);

    setTimeout(() => {
      assert.notCalled(pullRequestReview.updateReview);
      done();
    }, 0);

  });

});
