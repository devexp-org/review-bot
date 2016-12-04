import service from '../';
import queueMock from '../../queue/__mocks__/';
import eventsMock from '../../events/__mocks__/';
import loggerMock from '../../logger/__mocks__/';
import teamManagerMock from '../../team-manager/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../model/model-pull-request/__mocks__/';

describe('service/command', function () {

  let queue, events, logger, teamManager;
  let PullRequestModel;
  let options, imports;

  beforeEach(function () {

    options = {
      events: ['github:issue_comment']
    };

    queue = queueMock();
    events = eventsMock();
    logger = loggerMock();

    teamManager = teamManagerMock();

    PullRequestModel = pullRequestModelMock();

    imports = {
      queue,
      events,
      logger,
      'team-manager': teamManager,
      'pull-request-model': PullRequestModel
    };

  });

  it('should subscribe on events', function () {
    service(options, imports);

    assert.calledWith(events.on, 'github:issue_comment');
  });

  it('should dispatch event to commands', function (done) {
    const command = sinon.stub().returns(Promise.resolve());
    const payload = {
      comment: { body: '/command' },
      pullRequest: pullRequestMock()
    };
    const dispatcher = service(options, imports);

    dispatcher.addCommand('command', '/command', command);

    events.on
      .withArgs('github:issue_comment')
      .callArgWith(1, payload);

    queue.dispatch
      .withArgs('pull-request#1')
      .callsArg(1);

    setTimeout(function () {
      assert.called(command);
      done();
    }, 0);
  });

});
