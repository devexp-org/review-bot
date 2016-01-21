import pullRequestMock from './pull_request';

export function pullRequestModelMock() {

  const stub = function () {
    return pullRequestMock();
  };

  stub.findById = sinon.stub();
  stub.findByUser = sinon.stub();
  stub.findByReviewer = sinon.stub();
  stub.findByRepositoryAndNumber = sinon.stub();
  stub.findInReviewByReviewer = sinon.stub();

  return stub;

}

export default function () {
  const getStub = sinon.stub();

  getStub.withArgs('pull_request').returns(pullRequestModelMock());

  return { get: getStub };
}


