import service from '../../steps/remove_already_reviewers';

import { pullRequestMock } from '../../../model/pull-request/__mocks__/';
import { reviewMembersMock } from '../../__mocks__/';

describe('services/review/steps/remove_already_reviewers', function () {

  let step, members, pullRequest;

  beforeEach(function () {
    step = service();

    members = reviewMembersMock();

    pullRequest = pullRequestMock();

    pullRequest.review = {
      reviewers: [
        { login: 'Hulk' },
        { login: 'Spider-Man' }
      ]
    };
  });

  it('should remove already reviewers', function (done) {
    const review = { members, pullRequest };

    const expected = [
      { login: 'Hulk', rank: -Infinity },
      { login: 'Spider-Man', rank: -Infinity }
    ];

    step(review)
      .then(actual => assert.sameDeepMembers(actual, expected))
      .then(done, done);
  });

  it('should do nothing if there are no team', function (done) {
    const review = { members: [], pullRequest };

    step(review)
      .then(actual => assert.deepEqual(actual, []))
      .then(done, done);
  });

  it('should do nothing if there are no reviewers', function (done) {
    pullRequest.review.reviewers = [];
    const review = { members, pullRequest };

    step(review)
      .then(actual => assert.deepEqual(actual, []))
      .then(done, done);
  });

});
