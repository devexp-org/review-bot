export default function mock() {

  const orgsMock = {
    getTeams: sinon.stub().callsArg(1),
    getMembers: sinon.stub().callsArg(1),
    getTeamMembers: sinon.stub().callsArg(1)
  };

  const reposMock = {
    getCommits: sinon.stub().callsArg(1),
    getContent: sinon.stub().callsArg(1)
  };

  const pullRequestsMock = {
    get: sinon.stub().callsArg(1),
    update: sinon.stub().callsArg(1),
    getFiles: sinon.stub().callsArg(1)
  };

  return {
    orgs: orgsMock,
    repos: reposMock,
    pullRequests: pullRequestsMock
  };

}
