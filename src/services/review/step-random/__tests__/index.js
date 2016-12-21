import { find } from 'lodash';
import service from '../';

import { reviewMock } from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';

describe('services/review/steps/random', function () {

  let step, members, pullRequest, options;

  beforeEach(function () {
    step = service();

    members = reviewMock();

    options = { max: 5 };

    pullRequest = pullRequestMock();
  });

  describe('#name', function () {

    it('should return `random`', function () {
      assert.equal(step.name(), 'random');
    });

  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

  });

  it('should add random value to rank to each member', function (done) {
    const review = { members, pullRequest };
    const SpiderManOldRank = find(review.members, { login: 'Spider-Man' }).rank;

    step.process(review, options)
      .then(actual => {
        const SpiderManNewRank = find(actual.members, { login: 'Spider-Man' }).rank;
        assert.isAbove(SpiderManNewRank, SpiderManOldRank);
        assert.isBelow(SpiderManNewRank, SpiderManOldRank + options.max + 1);
      })
      .then(done, done);
  });

  it('should add `1` to every candidate if there is no `max` option', function (done) {
    const review = { members, pullRequest };
    const SpiderManOldRank = find(review.members, { login: 'Spider-Man' }).rank;

    step.process(review, {})
      .then(actual => {
        const SpiderManNewRank = find(actual.members, { login: 'Spider-Man' }).rank;
        assert.equal(SpiderManNewRank, SpiderManOldRank + 1);
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
