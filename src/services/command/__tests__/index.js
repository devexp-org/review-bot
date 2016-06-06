import { forEach } from 'lodash';

import service, { buildRegExp } from '../';
import queueMock from '../../queue/__mocks__/';
import eventsMock from '../../events/__mocks__/';
import loggerMock from '../../logger/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../model/pull-request/__mocks__/';

function makePositiveCases(command) {
  return [
    `${command}`,
    `Lorem ipsum dolor sit amet ${command}`,
    `${command} lorem ipsum dolor sit amet`,
    `Lorem ipsum dolor sit amet, ${command} consectetur adipisicing elit`,
    `Lorem ipsum dolor sit amet,\n${command} consectetur adipisicing elit`
  ];
}

function makeNegativeCases(command) {
  return [
    `Lorem ipsum dolor sit amet${command}`,
    `${command}lorem ipsum dolor sit amet`,
    `lorem ipsum dolor${command} sit amet`
  ];
}

describe('service/command', function () {

  let queue, events, logger, pullRequest, PullRequestModel, commandHandlerStart;
  let options, imports, payload;

  beforeEach(function () {

    options = {
      events: ['github:issue_comment'],
      commands: [{ test: '/start', handlers: ['command-handler-start'] }]
    };

    queue = queueMock();
    events = eventsMock();
    logger = loggerMock();

    pullRequest = pullRequestMock();

    PullRequestModel = pullRequestModelMock();

    payload = {
      comment: {
        user: 'Spider-Man',
        body: '/start'
      },
      pullRequest: pullRequest
    };

    commandHandlerStart = sinon.stub().returns(Promise.resolve());

    imports = {
      queue,
      events,
      logger,
      'pull-request-model': PullRequestModel,
      'command-handler-start': commandHandlerStart
    };

  });

  it('should subscribe on events', function () {
    service(options, imports);

    assert.calledWith(events.on, 'github:issue_comment');
  });

  it('should dispatch event to handlers', function (done) {
    queue.dispatch
      .withArgs('pull-request#1')
      .callsArg(1);

    events.on
      .withArgs('github:issue_comment')
      .callsArgWith(1, payload);

    imports['command-handler-start'] = function (command, payload) {
      assert.equal(payload, payload);
      assert.equal(command, payload.comment.body);
      done();
    };

    service(options, imports);

  });

  it('should throw an error of handler is not given', function () {
    delete imports['command-handler-start'];

    assert.throws(() => service(options, imports), /not found/);
  });

  describe('#buildRegExp', function () {

    const testCases = [
      {
        test: '/command',
        positive: makePositiveCases('/command')
      },
      {
        test: '/command|/команда|ok',
        positive: [].concat(
          makePositiveCases('/command'),
          makePositiveCases('/команда'),
          'ok Lorem ipsum dolor sit amet'
        ),
        negative: [].concat(
          makeNegativeCases('ok'),
          makePositiveCases('!ok'),
          makeNegativeCases('command'),
          makeNegativeCases('команда')
        )
      }
    ];

    testCases.forEach(command => {

      const regexp = buildRegExp(command.test);

      forEach(command.positive, (comment) => {
        it('should find command using regexp — ' + command.test, function () {
          assert.match(comment, regexp);
        });
      });

      forEach(command.negative, (comment) => {
        it('should not find command using regexp — ' + command.test, function () {
          assert.notMatch(comment, regexp);
        });
      });

    });

  });

});
