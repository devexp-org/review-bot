import webhook from '../issue_comment';
import modelMock from '../../../model/__mocks__/';
import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../../model/model-pull-request/__mocks__/';

describe('services/github-webhook/webhooks/issue_comment', function () {

  let payload, imports, logger, events, model;
  let pullRequest, PullRequestModel;

  beforeEach(function () {

    model = modelMock();
    logger = loggerMock();
    events = eventsMock();

    pullRequest = pullRequestMock();

    PullRequestModel = pullRequestModelMock();

    imports = { model, logger, events };

    payload = {
      action: 'issue_comment',
      issue: {
        title: 'The Ultimate Question of Life, the Universe, and Everything',
        number: 42,
        html_url: 'http://'
      },
      repository: {
        full_name: 'devexp-org/devexp'
      }
    };

    model
      .withArgs('pull_request')
      .returns(PullRequestModel);

    PullRequestModel.findByRepositoryAndNumber
      .returns(Promise.resolve(pullRequest));

  });

  it('should trigger system event `github:issue_comment`', function (done) {
    webhook(payload, imports)
      .then(() => assert.calledWith(events.emit, 'github:issue_comment'))
      .then(done, done);
  });

  it('should reject promise if pull request was not found', function (done) {
    PullRequestModel.findByRepositoryAndNumber
      .returns(Promise.resolve(null));

    webhook(payload, imports)
      .then(() => assert.fail())
      .catch(e => assert.match(e.message, /not found/))
      .then(done, done);
  });

});
