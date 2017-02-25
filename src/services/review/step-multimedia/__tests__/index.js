import { map, find, pick } from 'lodash';
import service from '../';

import { reviewMock } from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';
import teamManagerMock from '../../../team-manager/__mocks__';

describe('services/review/steps/multimedia', function () {

  let step, members, review, teamManager, pullRequest, options, imports;

  beforeEach(function () {

    members = reviewMock();

    teamManager = teamManagerMock();

    options = {
      videoTeam: '10,11',
      imagesTeam: '12'
    };

    imports = {
      'team-manager': teamManager
    };

    find(members, { login: 'Black Widow' }).staffGroupId = 10;
    find(members, { login: 'Captain America' }).staffGroupId = 11;
    find(members, { login: 'Spider-Man' }).staffGroupId = 12;
    find(members, { login: 'Thor' }).staffGroupId = 12;

    pullRequest = pullRequestMock();

    review = { members, pullRequest };

    step = service({}, imports);
  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

  });

  it('should return all members if title contains `SAKHALIN`', function (done) {
    pullRequest.title = 'SAKHALIN-111';

    step.process(review, options)
      .then(actual => {
        assert.lengthOf(actual.members, 7);
      })
      .then(done, done);
  });

  it('should return video team members only if title contains `VIDEOUI`', function (done) {
    pullRequest.title = 'VIDEOUI-111';

    const expected = [
      { login: 'Black Widow', rank: 10 },
      { login: 'Captain America', rank: 5 }
    ];

    step.process(review, options)
      .then(actual => {
        const result = map(actual.members, (member) => pick(member, ['login', 'rank']));
        assert.sameDeepMembers(result, expected);
      })
      .then(done, done);
  });

  it('should return images team members only if title contains `IMAGESUI`', function (done) {
    pullRequest.title = 'IMAGESUI-111';

    const expected = [
      { login: 'Spider-Man', rank: 6 },
      { login: 'Thor', rank: 3 }
    ];

    step.process(review, options)
      .then(actual => {
        const result = map(actual.members, (member) => pick(member, ['login', 'rank']));
        assert.sameDeepMembers(result, expected);
      })
      .then(done, done);
  });

  it('should set `mmTeam` property to each member', function (done) {

    const expected = [
      { login: 'Black Widow', rank: 10, mmTeam: 'video' },
      { login: 'Captain America', rank: 5, mmTeam: 'video' },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Hulk', rank: 8 },
      { login: 'Iron Man', rank: 7 },
      { login: 'Spider-Man', rank: 6, mmTeam: 'images' },
      { login: 'Thor', rank: 3, mmTeam: 'images' }
    ];

    step.process(review, options)
      .then(actual => {
        const result = map(actual.members, (member) => pick(member, ['login', 'rank', 'mmTeam']));
        assert.sameDeepMembers(result, expected);
      })
      .then(done, done);
  });

});
