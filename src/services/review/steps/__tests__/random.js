import service from '../random';

import { pullRequestMock } from
  '../../../model/model-pull-request/__mocks__/';
import { reviewMembersMock } from '../../__mocks__/';

describe('services/review/steps/random', () => {

  let step, members, pullRequest, options;

  beforeEach(function () {
    step = service();

    members = reviewMembersMock();

    pullRequest = pullRequestMock();

    options = { max: 2 };
  });

  it('should add random value to rank to each member', done => {
    const review = { members, pullRequest };

    step(review, options)
      .then(reviewers => assert.isArray(reviewers))
      .then(done, done);
  });

  it('should do nothing if there are no team', done => {
    const review = { members: [], pullRequest };

    step(review, options)
      .then(reviewers => assert.deepEqual(reviewers, []))
      .then(done, done);
  });

});
