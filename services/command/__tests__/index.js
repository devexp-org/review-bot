import { forEach } from 'lodash';
import service, { constructRegexp } from '../../command';

import modelMock from '../../model/__mocks__/index';
import eventsMock from '../../events/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';

describe('services/command', function () {

  let model, queue, events, logger;
  let options, imports, payload, PullRequestModel, promise;

  beforeEach(function () {

    model = modelMock();
    events = eventsMock();
    logger = loggerMock();

    queue = {
      dispatch: sinon.stub()
    };

    PullRequestModel = model.get('pull_request');

    payload = {
      pullRequest: {
        id: 42
      },
      comment: {
        body: 'Hello world'
      }
    };

    events.on.callsArgWith(1, payload);

    options = {
      events: ['github:issue_comment']
    };

    imports = { model, queue, events, logger };

    promise = (x) => Promise.resolve(x);

  });

  it('should startup command service', function () {
    const dispatcher = service(options, imports);

    assert.isObject(dispatcher);
    assert.property(dispatcher, 'dispatch');

    assert.calledWith(events.on, 'github:issue_comment');
  });

  it('should execute command if command-test passed', function (done) {
    payload.comment.body = 'bar';

    options.commands = [
      {
        test: 'foo',
        handlers: ['fooHandler']
      },
      {
        test: 'bar',
        handlers: ['barHandler']
      }
    ];

    queue.dispatch.callsArg(1);

    imports.fooHandler = sinon.stub();
    imports.barHandler = sinon.stub();

    const pull = {};

    PullRequestModel.findById.withArgs(42).returns(promise(pull));

    service(options, imports);

    setTimeout(function () {
      assert.notCalled(imports.fooHandler);
      assert.called(imports.barHandler);
      done();
    }, 1);

  });

  describe('#constructRegexp', function () {

    function makeCommonCases(command) {
      return [
        `${command}`,
        ` ${command}`,
        `Lorem ipsum dolor sit amet ${command}`,
        `Lorem ipsum dolor sit amet, ${command} consectetur adipisicing elit.`,
        `Lorem ipsum dolor sit amet,\n ${command} consectetur adipisicing elit.`,
        `Lorem ipsum dolor sit amet,\n ${command}\n consectetur adipisicing elit.`
      ];
    }

    function makeNegativeCases(command) {
      return [
        `${command}lorem ipsum dolor sit amet`,
        `Lorem ipsum${command} dolor sit amet`,
        `Lorem ipsum dolor sit amet${command}`
      ];
    }


    const testCases = [
      {
        test: '\/start',
        positive: makeCommonCases('/start')
      },
      {
        test: '\/ok|\/ок|^ok|^ок',
        positive: [].concat(
          makeCommonCases('/ok'),
          makeCommonCases('/ок'),
          'ok Lorem ipsum dolor sit amet',
          'ок Lorem ipsum dolor sit amet'
        ),
        negative: [].concat(
          makeCommonCases('/!ok'),
          makeCommonCases('!ok'),
          makeNegativeCases('ok'),
          makeNegativeCases('ок'),
          `Lorem ipsum dolor sit amet ok`,
          `Lorem ipsum dolor sit amet, ok consectetur adipisicing elit.`,
          `Lorem ipsum dolor sit amet,\n ok consectetur adipisicing elit.`,
          `Lorem ipsum dolor sit amet,\n ok\n consectetur adipisicing elit.`,
          `Lorem ipsum dolor sit amet ок`,
          `Lorem ipsum dolor sit amet, ок consectetur adipisicing elit.`,
          `Lorem ipsum dolor sit amet,\n ок consectetur adipisicing elit.`,
          `Lorem ipsum dolor sit amet,\n ок\n consectetur adipisicing elit.`
        )
      },
      {
        test: '\/?!ok|\/?!ок$$',
        positive: [].concat(makeCommonCases('/!ok'), makeCommonCases('!ok')),
        negative: [].concat(makeCommonCases('/ok'), makeCommonCases('ok'))
      },
      {
        test: '\/busy',
        positive: makeCommonCases('/busy')
      },
      {
        test: '\/change',
        positive: makeCommonCases('/change')
      },
      {
        test: '\/add|\\+@?[\\w]+',
        positive: [].concat(
          makeCommonCases('/add user'),
          makeCommonCases('/add @user'),
          makeCommonCases('+user'),
          makeCommonCases('+@user')
        )
      },
      {
        test: '\/remove|\\-@?[\\w]+',
        positive: [].concat(
          makeCommonCases('/remove user'),
          makeCommonCases('/remove @user'),
          makeCommonCases('-user'),
          makeCommonCases('-@user')
        )
      },
      {
        test: '\/?ping',
        positive: [].concat(
          makeCommonCases('ping'),
          makeCommonCases('/ping')
        ),
        negative: makeNegativeCases('ping')
      }
    ];

    testCases.forEach(command => {
      const regexp = constructRegexp(command.test);

      forEach(command.positive, c => {
        it('should find command in text for regexp — ' + command.test, () => {
          assert.match(c, regexp);
        });
      });

      forEach(command.negative, c => {
        it('should not find command in text for regexp — ' + command.test, () => {
          assert.notMatch(c, regexp);
        });
      });
    });

  });

});
