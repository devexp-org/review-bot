import service from '../index';
import eventsMock from '../../../services/events/__mocks__/';
import loggerMock from '../../../services/logger/__mocks__/';
import reviewMock from '../../../services/review/__mocks__/';
import { pullRequestMock } from
  '../../../services/model/pull-request/__mocks__/';
import pullRequestReviewMock from
  '../../../services/pull-request-review/__mocks__/';

describe('plugins/autoassign', function () {

  let options, imports;
  let payload, pullRequest, reviewResult;

  beforeEach(function () {

    options = {};

    imports = {
      events: eventsMock(),
      logger: loggerMock(),
      review: reviewMock(),
      'pull-request-review': pullRequestReviewMock()
    };

    pullRequest = pullRequestMock();

    payload = { pullRequest };

    reviewResult = {
      ranks: [1, 2, 3],
      members: ['Captain America', 'Hawkeye']
    };

    imports.events.on
      .withArgs('github:pull_request:opened')
      .callsArgWith(1, payload);

    imports.review.choose
      .withArgs(pullRequest)
      .returns(Promise.resolve(reviewResult));

  });

  it('should start review when someone open a new pull request', function (done) {

    service(options, imports);

    setTimeout(() => {
      assert.calledWithExactly(
        imports['pull-request-review'].updateReview,
        payload.pullRequest,
        reviewResult
      );
      done();
    }, 0);

  });

  it('should not restart review if reviewers were selected before', function (done) {

    pullRequest.review.reviewers = [{ login: 'Hulk' }];

    service(options, imports);

    setTimeout(() => {
      assert.notCalled(imports['pull-request-review'].updateReview);
      done();
    }, 0);

  });

});
