import service from '../';

import modelMock from '../../../model/__mocks__/';
import { reviewMock } from '../../__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../../model/model-pull-request/__mocks__/';
import {
  pullRequestReviewMixin,
  pullRequestModelReviewMixin
} from '../../../pull-request-review/__mocks__/';

describe('services/review/steps/load', function () {

  let step, members, model, pullRequest, PullRequestModel;
  let options, imports;

  beforeEach(function () {

    model = modelMock();

    members = reviewMock();

    pullRequest = pullRequestMock();

    PullRequestModel = pullRequestModelMock(
      pullRequestReviewMixin,
      pullRequestModelReviewMixin
    );

    PullRequestModel.findInReviewByReviewer
      .returns(Promise.resolve([]));

    model
      .withArgs('pull_request')
      .returns(PullRequestModel);

    options = { max: 1 };
    imports = { model };

    step = service({}, imports);
  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

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
      { login: 'Black Widow', rank: 9 },
      { login: 'Captain America', rank: 5 },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Hulk', rank: 6 },
      { login: 'Iron Man', rank: 7 },
      { login: 'Spider-Man', rank: 6 },
      { login: 'Thor', rank: 3 }
    ];

    PullRequestModel.findInReviewByReviewer
      .withArgs('Black Widow')
      .returns(Promise.resolve([activePull1]));

    PullRequestModel.findInReviewByReviewer
      .withArgs('Hulk')
      .returns(Promise.resolve([activePull1, activePull2]));

    step = service({}, imports);

    step.process(review, options)
      .then(actual => {
        assert.sameDeepMembers(actual.members, expected);
      })
      .then(done, done);
  });

  it('should do nothing if there are no team', function (done) {
    const review = { members: [], pullRequest };

    step.process(review, options)
      .then(review => assert.deepEqual(review.members, []))
      .then(done, done);
  });

});
