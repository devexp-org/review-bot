import webhook from '../pull_request';
import modelMock from '../../../model/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import eventsMock from '../../../events/__mocks__/';
import pullRequestGitHubMock from '../../../pull-request-github/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../../model/model-pull-request/__mocks__/';

describe('services/webhook/github/pull_request', function () {

  let payload, imports, logger, events, model;
  let pullRequest, PullRequestModel, pullRequestGitHub;

  beforeEach(function () {

    model = modelMock();
    logger = loggerMock();
    events = eventsMock();
    pullRequest = pullRequestMock();
    PullRequestModel = pullRequestModelMock();
    pullRequestGitHub = pullRequestGitHubMock(pullRequest);

    imports = {
      model,
      events,
      logger,
      'pull-request-github': pullRequestGitHub
    };

    payload = {
      id: 123456789,
      action: 'open',
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

    model
      .withArgs('pull_request')
      .returns(PullRequestModel);

    PullRequestModel.findById
      .returns(Promise.resolve(pullRequest));

  });

  it('should trigger event `github:pull_request:*`', function (done) {
    webhook(payload, imports)
      .then(() => assert.calledWith(events.emitAsync, 'github:pull_request:open'))
      .then(done, done);
  });

  it('should create new object if pull request is not found', function (done) {
    PullRequestModel.findById
      .returns(Promise.resolve(null));

    webhook(payload, imports)
      .then(() => {
        assert.calledWithMatch(
          events.emitAsync,
          'github:pull_request:open',
          sinon.match.object
      );
      })
      .then(done, done);
  });

});
