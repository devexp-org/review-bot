import service from '../set-components';

import loggerMock from '../../../services/logger/__mocks__/index';
import eventsMock from '../../../services/events/__mocks__/index';
import startrekMock from '../__mocks__/index';
import componentsAPIMock from '../../components-api/__mocks__/index';
import { pullRequestMock } from
  '../../../services/model/collections/__mocks__/pull-request';

describe('plugins/startrek/set-issue-status', function () {

  let options, imports;
  let events, logger, startrek, componentsAPI, payload, pullRequest;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();
    startrek = startrekMock();
    componentsAPI = componentsAPIMock();

    pullRequest = pullRequestMock();

    payload = { pullRequest };

    options = {
      queues: ['TEST'],
      events: ['review:start']
    };

    imports = { events, logger, startrek, 'components-api': componentsAPI };

    startrek.parseIssue.returns(['TEST-1']);

  });

  it('should update issue components', function (done) {
    const tags = ['tag1', 'tag2'];

    events.on.withArgs('review:start').callsArgWith(1, payload);
    componentsAPI.getResponsibles.returns(Promise.resolve([
      { codeName: 'tag1' },
      { codeName: 'tag2' }
    ]));

    service(options, imports);

    setTimeout(() => {
      assert.calledWith(startrek.issueUpdate, 'TEST-1', { tags: { add: tags } });
      done();
    }, 0);
  });

  it('should not update issue components if cannot parse issue from pull request title', function (done) {
    startrek.parseIssue.returns([]);

    events.on.withArgs('review:start').callsArgWith(1, payload);

    service(options, imports);

    setTimeout(() => {
      assert.notCalled(startrek.issueUpdate);
      done();
    }, 0);
  });

});
