export default function mock(pullRequest) {

  const promise = () => Promise.resolve(pullRequest);

  if (pullRequest) {
    pullRequest.hasReviewers = sinon.stub();
  }

  return {
    stopReview: sinon.stub().returns(promise()),
    startReview: sinon.stub().returns(promise()),
    approveReview: sinon.stub().returns(promise()),
    changesNeeded: sinon.stub().returns(promise()),
    updateReview: sinon.stub().returns(promise())
  };

}

export function pullRequestReviewMixin(stub) {
  stub.review = {
    status: 'notstarted',
    history: [],
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
