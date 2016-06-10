import PullRequestGitHubDelayed from '../class';

import githubMock from '../../github/__mocks__/';
import { pullRequestMock } from '../../model/pull-request/__mocks__/';

describe('services/pull-request-github-delayed/class', function () {

  let github, options, pullRequest, pullRequestGitHub;

  beforeEach(function () {
    github = githubMock();
    options = {};
    pullRequest = pullRequestMock();

    pullRequestGitHub = new PullRequestGitHubDelayed(github, options, 1000);
  });

  describe('#syncPullRequestWithGitHub', function () {

    let clock;
    beforeEach(function () {
      clock = sinon.useFakeTimers();

      sinon.stub(pullRequestGitHub, 'loadPullRequestFromGitHub')
        .returns(Promise.resolve(pullRequest));
      sinon.stub(pullRequestGitHub, 'updatePullRequestOnGitHub')
        .returns(Promise.resolve(pullRequest));
    });

    afterEach(function () {
      clock.restore();
    });

    it('should collapse many sync requests of pull request into 1', function (done) {
      const p1 = pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
      const p2 = pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
      const p3 = pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);

      Promise.all([p1, p2, p3])
        .then(() => {
          assert.calledOnce(pullRequestGitHub.loadPullRequestFromGitHub);
        })
        .then(done, done);

      clock.tick(2000);
    });

    it('should reject all promises if request fails', function (done) {
      pullRequestGitHub.loadPullRequestFromGitHub
        .returns(Promise.reject(new Error(/just error/)));

      const p1 = pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
      const p2 = pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
      const p3 = pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);

      let count = 0;
      p1
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /just error/))
        .then(() => (++count === 3) && done());
      p2
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /just error/))
        .then(() => (++count === 3) && done());
      p3
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /just error/))
        .then(() => (++count === 3) && done());

      clock.tick(2000);

    });

  });

});
