import service from '../';
import queueMock from '../../../queue/__mocks__/';
import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { pullRequestMock } from
  '../../../model/model-pull-request/__mocks__/';
import pullRequestGitHubMock from
  '../../../pull-request-github/__mocks__/';
// import { pullRequestReviewMixin } from
//   '../../../pull-request-review/__mocks__/';

describe('services/badges-review', function () {

  let options, imports, payload;
  let queue, events, logger, pullRequest, pullRequestGitHub;

  beforeEach(function () {

    queue = queueMock();
    events = eventsMock();
    logger = loggerMock();
    pullRequestGitHub = pullRequestGitHubMock();

    // pullRequest = pullRequestMock(pullRequestReviewMixin);
    pullRequest = pullRequestMock();

    payload = { pullRequest };

    options = {};
    imports = {
      queue,
      events,
      logger,
      'pull-request-github': pullRequestGitHub
    };

  });

  it('should update badges when review started', function (done) {
    events.on
      .withArgs('review:started')
      .callsArgWith(1, payload);

    queue.dispatch
      .withArgs('pull-request#1')
      .returns(Promise.resolve())
      .callsArg(1);

    service(options, imports);

    setTimeout(() => {
      assert.calledWith(
        pullRequestGitHub.syncPullRequestWithGitHub, pullRequest
      );
      assert.calledWith(
        pullRequestGitHub.setBodySection, pullRequest, 'review:badge'
      );
      done();
    }, 0);
  });

});
