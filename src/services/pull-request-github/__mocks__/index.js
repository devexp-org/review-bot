export default function mock(pullRequest) {

  const promise = () => Promise.resolve(pullRequest);

  return {
    loadPullRequestFromGitHub: sinon.stub().returns(promise()),
    updatePullRequestOnGitHub: sinon.stub().returns(promise()),
    loadPullRequestFiles: sinon.stub().returns(promise()),
    syncPullRequestWithGitHub: sinon.stub(),
    setBodySection: sinon.stub(),
    setPayload: sinon.stub()
  };

}
