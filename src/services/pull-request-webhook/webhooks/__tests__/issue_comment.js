import webhook from '../issue_comment';
import loggerMock from '../../../logger/__mocks__/';
import eventsMock from '../../../events/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../../model/pull-request/__mocks__/';

describe('services/pull-request-webhook/webhooks/issue_comment', function () {

  let payload, imports, logger, events;
  let pullRequest, PullRequestModel;

  beforeEach(function () {

    logger = loggerMock();
    events = eventsMock();

    PullRequestModel = pullRequestModelMock();

    imports = { 'pull-request-model': PullRequestModel, logger, events };

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

    pullRequest = pullRequestMock();

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
