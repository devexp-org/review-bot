import service from '../';

import modelMock from '../../model/__mocks__/';
import queueMock from '../../queue/__mocks__/';
import eventsMock from '../../events/__mocks__/';
import loggerMock from '../../logger/__mocks__/';
import teamManagerMock from '../../team-manager/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../model/model-pull-request/__mocks__/';

describe('service/command', function () {

  let model, queue, events, logger, teamManager, pullRequest, PullRequestModel;
  let command, options, imports;

  beforeEach(function () {

    pullRequest = pullRequestMock();

    command = {
      pattern: '/command',
      command: sinon.stub().returns(Promise.resolve(pullRequest))
    };

    options = {
      events: ['github:issue_comment'],
      commands: { command: 'command' }
    };

    model = modelMock();
    queue = queueMock();
    events = eventsMock();
    logger = loggerMock();

    teamManager = teamManagerMock();

    PullRequestModel = pullRequestModelMock();

    model
      .withArgs('pull_request')
      .returns(PullRequestModel);

    imports = {
      model,
      queue,
      events,
      logger,
      command,
      'team-manager': teamManager
    };

  });

  it('should subscribe on events', function () {
    service(options, imports);

    assert.calledWith(events.on, 'github:issue_comment');
  });

  it('should dispatch event to commands', function (done) {

    const payload = {
      comment: { body: '/command' },
      pullRequest: pullRequest
    };

    events.on
      .withArgs('github:issue_comment')
      .callsArgWith(1, payload);

    queue.dispatch
      .withArgs('pull-request#1')
      .callsArg(1);

    service(options, imports);

    setTimeout(function () {
      assert.called(command.command);
      done();
    }, 0);

  });

  it('should throw an error if command module was not given', function () {
    options.commands = ['unknown-command'];

    assert.throws(() => service(options, imports), /cannot find/i);
  });

});
