import service from '../addon';
import schemaMock from '../../model/__mocks__/schema';
import staticMock from '../../model/__mocks__/static';

import { pullRequestMock } from '../../model/model-pull-request/__mocks__/';
import { pullRequestReviewMixin } from '../__mocks__/';

describe('services/pull-request-review/addon', function () {

  let model, plugin, staticStub, pullRequest;

  beforeEach(function () {
    model = schemaMock();

    plugin = service();

    staticStub = staticMock();

    pullRequest = pullRequestMock(pullRequestReviewMixin);

    plugin(model);
  });

  it('should add static method "findInReview"', function () {
    model.statics.findInReview.call(staticStub);
  });

  it('#should add static method "findByReviewer"', function () {
    model.statics.findByReviewer.call(staticStub);
  });

  it('#should add static method "findInReviewByReviewer"', function () {
    model.statics.findInReviewByReviewer.call(staticStub);
  });

  describe('#hasReviewers', function () {

    it('should return true if pull request has reviewers', function () {
      pullRequest.review.reviewers = [{ login: 'foo' }];
      const result = model.methods.hasReviewers.call(pullRequest);

      assert.equal(result, true);
    });

    it('should return false if pull request has not reviewers', function () {
      pullRequest.review.reviewers = [];
      const result = model.methods.hasReviewers.call(pullRequest);

      assert.equal(result, false);
    });

  });

});
