import { forEach } from 'lodash';
import CommandDispatcher, { buildRegExp } from '../class';

import queueMock from '../../queue/__mocks__/';
import teamManagerMock from '../../team-manager/__mocks__/';
import { teamDriverMock } from '../../team-manager/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../model/model-pull-request/__mocks__/';

describe('services/command/class', function () {

  let team, queue, pullRequest, dispatcher, payload;
  let teamManager, pullRequestModel;

  beforeEach(function () {

    team = teamDriverMock();

    queue = queueMock();

    pullRequest = pullRequestMock();

    pullRequestModel = pullRequestModelMock();

    teamManager = teamManagerMock();
    teamManager.findTeamByPullRequest.returns(Promise.resolve(team));

    payload = { pullRequest };

    queue.dispatch
      .withArgs('pull-request#1')
      .callsArg(1)
      .returns(Promise.resolve());

    pullRequestModel.findById
      .returns(Promise.resolve(pullRequest));

    dispatcher = new CommandDispatcher(queue, teamManager, pullRequestModel);

  });

  describe('#addCommand', function () {

    it('should dispatch event to handlers', function (done) {
      const commandStart = sinon.stub().returns(Promise.resolve(pullRequest));

      dispatcher.addCommand('start', '/start', commandStart);

      dispatcher.dispatch('/start', payload)
        .then(() => assert.calledWith(commandStart, '/start', payload))
        .then(done, done);
    });

  });

  describe('#dispatch', function () {

    let h1, h2, comment;

    beforeEach(function () {
      h1 = sinon.stub().returns(Promise.resolve(pullRequest));
      h2 = sinon.stub().returns(Promise.resolve(pullRequest));

      comment = 'first line\n/fireball\nthird line';
    });

    it('should dispatch each line of comment to each command', function (done) {
      dispatcher.addCommand('all', ['.*'], h1);
      dispatcher.addCommand('fireball', ['/fireball'], h2);

      dispatcher.dispatch(comment, payload)
        .then(() => {
          assert.calledThrice(h1);
          assert.calledOnce(h2);
        })
        .then(done, done);
    });

    it('should execute each command only once for each line', function (done) {
      dispatcher.addCommand('all', ['.*', '/fireball'], h1);

      dispatcher.dispatch(comment, payload)
        .then(() => assert.calledThrice(h1))
        .then(done, done);
    });

    it('should take regexp for command from team config', function (done) {
      dispatcher.addCommand('fireball', ['/fireball'], h1);

      team.getOption
        .withArgs('command.regexp.fireball')
        .returns(['first line']);

      dispatcher.dispatch(comment, payload)
        .then(() => assert.calledTwice(h1))
        .then(done, done);
    });

    it('should return rejected promise if command handler was rejected', function (done) {
      dispatcher.addCommand('all', ['.*'], h1);

      queue.dispatch
        .withArgs('pull-request#1')
        .returns(Promise.reject(new Error('just error')));

      dispatcher.dispatch(comment, payload)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /just error/))
        .then(done, done);
    });

    it('should pass parsed arguments from RegExp to handler', function (done) {
      comment = '/change @old to @new';

      dispatcher.addCommand('change', ['/change @(\\w+) to @(\\w+)'], h1);

      dispatcher.dispatch(comment, payload)
        .then(() => {
          assert.calledWith(h1, comment, payload, sinon.match(function (arglist) {
            assert.deepEqual(arglist, ['old', 'new']);
            return true;
          }));
        })
        .then(done, done);
    });

    it('should return rejected promise if team is not found', function (done) {
      dispatcher.addCommand('all', ['.*'], h1);

      teamManager.findTeamByPullRequest.returns(Promise.resolve(null));

      dispatcher.dispatch(comment, payload)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /not found/))
        .then(done, done);
    });

  });

});

describe('services/command/#buildRegExp', function () {

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
