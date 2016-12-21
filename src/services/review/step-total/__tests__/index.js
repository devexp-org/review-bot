import service from '../';

import { reviewMock } from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';

describe('services/review/steps/total', function () {

  let step, options, members, pullRequest;

  beforeEach(function () {
    members = reviewMock();

    options = { max: 2 };

    pullRequest = pullRequestMock();

    step = service();
  });

  describe('#name', function () {

    it('should return `total`', function () {
      assert.equal(step.name(), 'total');
    });

  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

  });

  it('should keep only `option.max` reviewers', function (done) {
    const review = { members, pullRequest };

    const expected = [
      { login: 'Black Widow', rank: 10 },
      { login: 'Captain America', rank: 5 }
    ];

    step.process(review, options)
      .then(actual => assert.deepEqual(actual.reviewers, expected))
      .then(done, done);
  });

  it('should do nothing if there are no team', function (done) {
    const review = { members: [], pullRequest };

    step.process(review, options)
      .then(actual => assert.deepEqual(actual.reviewers, []))
      .then(done, done);
  });

});
