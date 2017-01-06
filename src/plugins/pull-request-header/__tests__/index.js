import service from '../';

import queueMock from '../../../services/queue/__mocks__/';
import eventsMock from '../../../services/events/__mocks__/';
import startrekMock from '../../../plugins/yandex-startrek/__mocks__/';
import pullRequestGitHubMock from '../../../services/pull-request-github/__mocks__/';
import { pullRequestMock } from
  '../../../services/model/model-pull-request/__mocks__/';

describe('plugins/pull-request-header', function () {

  let queue, events, startrek, pullRequestGitHub;
  let options, imports, payload, pullRequest;

  beforeEach(function () {

    queue = queueMock();
    events = eventsMock();
    startrek = startrekMock();
    pullRequestGitHub = pullRequestGitHubMock();

    pullRequest = pullRequestMock();
    pullRequest.repository.full_name = 'mm-interfaces/fiji';

    options = {
      queues: ['TASK', 'TODO']
    };
    imports = {
      queue,
      events,
      'yandex-startrek': startrek,
      'pull-request-github': pullRequestGitHub
    };

    payload = { pullRequest };

    queue.dispatch
      .callsArg(1);

    events.on
      .withArgs('review:updated')
      .callsArgWith(1, payload);

    startrek.parseIssue
      .withArgs(pullRequest.title, options.queues)
      .returns(['TASK-1', 'TODO-2']);

  });

  it('should set pull request body when pull request updated', function (done) {

    service(options, imports);

    setTimeout(() => {
      assert.calledWithMatch(
        pullRequestGitHub.setBodySection,
        pullRequest,
        sinon.match.string,
        sinon.match.string,
        sinon.match.number
      );
      done();
    }, 0);

  });

  it('should not update body if repo is not `fiji`', function (done) {
    pullRequest.repository.full_name = 'foo/bar';

    service(options, imports);

    setTimeout(() => {
      assert.notCalled(pullRequestGitHub.setBodySection);
      done();
    }, 0);

  });
});
