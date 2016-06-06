import service from '../load';

import { reviewMembersMock } from '../../__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../../model/pull-request/__mocks__/';

describe('services/review/steps/load', function () {

  let members, pullRequest, PullRequestModel;
  let options, imports;

  beforeEach(function () {
    members = reviewMembersMock();

    pullRequest = pullRequestMock();

    PullRequestModel = pullRequestModelMock();

    PullRequestModel.findInReviewByReviewer
      .returns(Promise.resolve([]));

    options = { max: 1 };
    imports = { 'pull-request-model': PullRequestModel };
  });

  it('should decrease rank if member has active reviews', function (done) {
    const review = { members, pullRequest };

    const activePull1 = {
      id: 1,
      review: {
        reviewers: [{ login: 'Black Widow' }, { login: 'Hulk' }]
      }
    };

    const activePull2 = {
      id: 2,
      review: {
        reviewers: [{ login: 'Hulk' }, { login: 'Batman' }]
      }
    };

    const expected = [
      { login: 'Hulk', rank: -2 },
      { login: 'Black Widow', rank: -1 }
    ];

    PullRequestModel.findInReviewByReviewer
      .withArgs('Black Widow')
      .returns(Promise.resolve([activePull1]));

    PullRequestModel.findInReviewByReviewer
      .withArgs('Hulk')
      .returns(Promise.resolve([activePull1, activePull2]));

    const step = service({}, imports);

    step(review, options)
      .then(actual => assert.sameDeepMembers(actual, expected))
      .then(done, done);
  });

  it('should do nothing if there are no reviewers', function (done) {
    const review = { members: [], pullRequest };

    const step = service({}, imports);

    step(review, options)
      .then(review => assert.sameDeepMembers(review.members, []))
      .then(done, done);
  });

});
