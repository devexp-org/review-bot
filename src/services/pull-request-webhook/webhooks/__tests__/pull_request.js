import webhook from '../pull_request';
import loggerMock from '../../../logger/__mocks__/';
import eventsMock from '../../../events/__mocks__/';
import pullRequestGitHubMock from '../../../pull-request-github/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../../model/pull-request/__mocks__/';

describe('services/pull-request-webhook/webhooks/pull_request', function () {

  let payload, imports, logger, events;
  let pullRequest, PullRequestModel, pullRequestGitHub;

  beforeEach(function () {

    logger = loggerMock();
    events = eventsMock();
    pullRequest = pullRequestMock();
    PullRequestModel = pullRequestModelMock();
    pullRequestGitHub = pullRequestGitHubMock(pullRequest);

    imports = {
      events,
      logger,
      'pull-request-model': PullRequestModel,
      'pull-request-github': pullRequestGitHub
    };

    payload = {
      id: 123456789,
      action: 'pull_request',
      pull_request: {
        title: 'The Ultimate Question of Life, the Universe, and Everything',
        number: 42,
        html_url: 'http://'
      },
      repository: {
        full_name: 'devexp-org/devexp',
        owner: {
          login: 'Abcde'
        }
      }
    };

    PullRequestModel.findById
      .returns(Promise.resolve(pullRequest));

  });

  it('should trigger event `github:pull_request`', function (done) {
    webhook(payload, imports)
      .then(() => events.emit.calledWith('github:pull_requset'))
      .then(done, done);
  });

  it('should create new object if pull request was not found', function (done) {
    PullRequestModel.findById
      .returns(Promise.resolve(null));

    webhook(payload, imports)
      .then(pullRequest => assert.isObject(pullRequest))
      .then(done, done);
  });

});
