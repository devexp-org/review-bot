export default function mock(pullRequest) {

  if (pullRequest) {
    pullRequest.hasReviewers = sinon.stub().returns(false);
  }

  return {
    stopReview: sinon.stub().returns(Promise.resolve(pullRequest)),
    denyReview: sinon.stub().returns(Promise.resolve(pullRequest)),
    startReview: sinon.stub().returns(Promise.resolve(pullRequest)),
    fixedReview: sinon.stub().returns(Promise.resolve(pullRequest)),
    updateReview: sinon.stub().returns(Promise.resolve(pullRequest)),
    approveReview: sinon.stub().returns(Promise.resolve(pullRequest)),
    changesNeeded: sinon.stub().returns(Promise.resolve(pullRequest))
  };

}

export function pullRequestReviewMixin(stub) {
  stub.review = {
    status: 'notstarted',
    reviewers: [],
    started_at: new Date(2000, 1, 1),
    updated_at: new Date(2000, 1, 2),
    completed_at: null
  };

  stub.hasReviewers = sinon.stub().returns(false);
}

export function pullRequestModelReviewMixin(stub) {
  stub.findInReview = sinon.stub().returns(Promise.resolve([]));
  stub.findByReviewer = sinon.stub().returns(Promise.resolve([]));
  stub.findInReviewByReviewer = sinon.stub().returns(Promise.resolve([]));
}
