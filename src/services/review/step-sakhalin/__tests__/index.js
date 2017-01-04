import { map, find, pick } from 'lodash';
import service from '../';

import { reviewMock } from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';

describe('services/review/steps/sakhalin', function () {

  let step, members, pullRequest, options;

  beforeEach(function () {
    step = service();

    members = reviewMock();

    options = { upRankCount: 10 };

    pullRequest = pullRequestMock();
    pullRequest.title = 'SAKHALIN-111';
  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

  });

  it('should inc rank to one member from images and one from video teams', function (done) {
    const review = { members, pullRequest };

    find(members, { login: 'Black Widow' }).mmTeam = 'video';
    find(members, { login: 'Captain America' }).mmTeam = 'video';
    find(members, { login: 'Spider-Man' }).mmTeam = 'images';
    find(members, { login: 'Thor' }).mmTeam = 'images';

    const expected = [
      { login: 'Black Widow', rank: 20 },
      { login: 'Captain America', rank: 5 },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Hulk', rank: 8 },
      { login: 'Iron Man', rank: 7 },
      { login: 'Spider-Man', rank: 16 },
      { login: 'Thor', rank: 3 }
    ];

    step.process(review, options)
      .then(actual => {
        const result = map(actual.members, (member) => pick(member, ['login', 'rank']));
        assert.sameDeepMembers(result, expected);
      })
      .then(done, done);
  });

  it('should change rank only if pull request title contains `SAKHALIN`', function (done) {
    pullRequest.title = 'TASK-1';
    const review = { members, pullRequest };

    find(members, { login: 'Black Widow' }).mmTeam = 'video';
    find(members, { login: 'Captain America' }).mmTeam = 'video';
    find(members, { login: 'Spider-Man' }).mmTeam = 'images';
    find(members, { login: 'Thor' }).mmTeam = 'images';

    const expected = [
      { login: 'Black Widow', rank: 10 },
      { login: 'Captain America', rank: 5 },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Hulk', rank: 8 },
      { login: 'Iron Man', rank: 7 },
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

  it('should do nothing if there are no team', function (done) {
    const review = { members: [], pullRequest };

    step.process(review, options)
      .then(actual => assert.deepEqual(actual.members, []))
      .then(done, done);
  });

});
