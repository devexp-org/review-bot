import service from '../set-components';

import loggerMock from '../../../../services/logger/__mocks__/';
import eventsMock from '../../../../services/events/__mocks__/';
import startrekMock from '../../../startrek/__mocks__/';
import componentsAPIMock from '../../api/__mocks__/';
import { pullRequestMock } from
  '../../../../services/model/pull-request/__mocks__/';

describe('plugins/resposible/startrek/set-components', function () {

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
