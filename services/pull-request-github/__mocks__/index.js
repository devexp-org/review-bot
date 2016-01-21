export default function () {
  return {
    loadPullRequest: sinon.stub(),
    savePullRequest: sinon.stub(),
    updatePullRequest: sinon.stub(),
    loadPullRequestFiles: sinon.stub(),
    syncPullRequest: sinon.stub(),
    setBodySection: sinon.stub(),
    fillPullRequestBody: sinon.stub(),
    buildBodyContent: sinon.stub(),
    cleanPullRequestBody: sinon.stub()
  };
}
