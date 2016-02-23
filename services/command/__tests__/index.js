import { constructRegexp } from '../';
import { forEach } from 'lodash';

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
    `Lorem ipsum dolor sit amet${command}`
  ];
}

describe('service/command#constructRegexp', () => {
  const testCases = [
    {
      test: '\/start',
      positive: makeCommonCases('/start')
    },
    {
      test: '\/ok|\/ок|^ok|^ок',
      positive: [].concat(
        makeCommonCases('/ok'), makeCommonCases('/ок'),
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
        makeCommonCases('/add user'), makeCommonCases('/add @user'),
        makeCommonCases('+user'), makeCommonCases('+@user')
      )
    },
    {
      test: '\/remove|\\-@?[\\w]+',
      positive: [].concat(
        makeCommonCases('/remove user'), makeCommonCases('/remove @user'),
        makeCommonCases('-user'), makeCommonCases('-@user')
      )
    },
    {
      test: '\/?ping',
      positive: [].concat(
        makeCommonCases('/ping'),
        makeCommonCases('ping')
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
