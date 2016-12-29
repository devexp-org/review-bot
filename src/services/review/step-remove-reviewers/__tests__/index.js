import service from '../';

import { reviewMock } from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';

describe('services/review/steps/remove_reviewers', function () {

  let step, members, pullRequest;

  beforeEach(function () {
    step = service();

    members = reviewMock();

    pullRequest = pullRequestMock();

    pullRequest.review = {
      reviewers: [
        { login: 'Hulk' },
        { login: 'Spider-Man' }
      ]
    };
  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

  });

  it('should remove reviewers', function (done) {
    const review = { members, pullRequest };

    const expected = [
      'Black Widow',
      'Captain America',
      'Hawkeye',
      'Iron Man',
      'Thor'
    ];

    step.process(review)
      .then(actual => {
        assert.deepEqual(actual.members.map(x => x.login), expected);
      })
      .then(done, done);
  });

  it('should do nothing if there are no candidates', function (done) {
    const review = { members: [], pullRequest };

    step.process(review)
      .then(actual => assert.deepEqual(actual.members, []))
      .then(done, done);
  });

  it('should do nothing if there are no reviewers', function (done) {
    const review = { members, pullRequest };

    pullRequest.review.reviewers = [];

    step.process(review)
      .then(actual => assert.deepEqual(actual.members, members))
      .then(done, done);
  });

});
