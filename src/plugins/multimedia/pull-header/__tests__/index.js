import service, { buildHeader } from '../';

import queueMock from '../../../../services/queue/__mocks__/';
import eventsMock from '../../../../services/events/__mocks__/';
import startrekMock from '../../../../plugins/startrek/__mocks__/';
import { pullRequestMock } from
  '../../../../services/model/pull-request/__mocks__/';
import pullRequestGitHubMock from
  '../../../../services/pull-request-github/__mocks__/';

describe('plugins/multimedia/pull-header', function () {

  describe('service', function () {

    let queue, events, startrek, pullRequest, pullRequestGitHub;
    let options, imports, payload;

    beforeEach(function () {

      queue = queueMock();
      events = eventsMock();
      startrek = startrekMock();
      pullRequestGitHub = pullRequestGitHubMock();

      pullRequest = pullRequestMock();

      payload = { pullRequest };

      options = {};

      imports = {
        queue,
        events,
        startrek,
        'pull-request-github': pullRequestGitHub
      };

      queue.dispatch
        .withArgs('pull-request#1')
        .callsArg(1);

      events.on
        .withArgs('review:updated')
        .callsArgWith(1, payload);

      startrek.parseIssue.returns([]);

      pullRequest.repository.full_name = 'mm-interfaces/fiji';

    });

    it('should update pull request body', function (done) {
      service(options, imports);

      setTimeout(function () {
        assert.called(queue.dispatch);
        done();
      }, 0);
    });

    it('should not update if it is not fiji project', function (done) {
      pullRequest.repository.full_name = 'search-interfaces/web4';

      service(options, imports);

      setTimeout(function () {
        assert.notCalled(queue.dispatch);
        done();
      }, 0);
    });

  });

  describe('#buildHeader', function () {

    it('should build header', function () {
      const header = buildHeader(1, ['TASK-1', 'TASK-2']);

      assert.include(header, 'https://st.yandex-team.ru/TASK-1');
      assert.include(header, 'https://st.yandex-team.ru/TASK-2');
      assert.include(
        header, 'http://buildfarm-d-pull-1.ti.balancer.serp.yandex.ru/'
      );
    });

  });

});
