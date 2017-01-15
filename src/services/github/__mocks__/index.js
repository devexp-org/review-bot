export default function mock() {

  const orgsMock = {
    getTeams: sinon.stub().callsArg(1),
    getMembers: sinon.stub().callsArg(1),
    getTeamMembers: sinon.stub().callsArg(1)
  };

  const usersMock = {
    getForUser: sinon.stub().callsArg(1)
  };

  const reposMock = {
    getCommits: sinon.stub().callsArg(1),
    getContent: sinon.stub().callsArg(1),
    createStatus: sinon.stub().callsArg(1)
  };

  const pullRequestsMock = {
    get: sinon.stub().callsArg(1),
    update: sinon.stub().callsArg(1),
    getFiles: sinon.stub().callsArg(1)
  };

  return {
    orgs: orgsMock,
    users: usersMock,
    repos: reposMock,
    pullRequests: pullRequestsMock
  };

}

mock.verify = function (mock) {

  let request;

  if (mock.orgs.getTeams.called) {
    request = sinon.match.has('org');
    assert.alwaysCalledWithExactly(mock.orgs.getTeams, request, sinon.match.func);
  }

  if (mock.orgs.getMembers.called) {
    request = sinon.match.has('org');
    assert.alwaysCalledWithExactly(mock.orgs.getMembers, request, sinon.match.func);
  }

  if (mock.orgs.getTeamMembers.called) {
    request = sinon.match.has('id');
    assert.alwaysCalledWithExactly(mock.orgs.getTeamMembers, request, sinon.match.func);
  }

  if (mock.users.getForUser.called) {
    request = sinon.match.has('username', sinon.match.string);
    assert.alwaysCalledWithExactly(mock.users.getForUser, request, sinon.match.func);
  }

  if (mock.repos.getCommits.called) {
    request = sinon.match.has('repo')
      .and(sinon.match.has('owner'))
      .and(sinon.match.has('path'));
    assert.alwaysCalledWithExactly(mock.repos.getCommits, request, sinon.match.func);
  }

  if (mock.repos.getContent.called) {
    request = sinon.match.has('repo')
      .and(sinon.match.has('user'))
      .and(sinon.match.has('path'));
    assert.alwaysCalledWithExactly(mock.repos.getContent, request, sinon.match.func);
  }

  if (mock.repos.createStatus.called) {
    request = sinon.match.has('repo')
      .and(sinon.match.has('owner'))
      .and(sinon.match.has('state'))
      .and(sinon.match.has('sha'));
    assert.alwaysCalledWithExactly(mock.repos.createStatus, request, sinon.match.func);
  }

  if (mock.pullRequests.get.called) {
    request = sinon.match.has('repo')
      .and(sinon.match.has('owner'))
      .and(sinon.match.has('number'));
    assert.alwaysCalledWithExactly(mock.pullRequests.get, request, sinon.match.func);
  }

  if (mock.pullRequests.update.called) {
    request = sinon.match.has('repo')
      .and(sinon.match.has('body'))
      .and(sinon.match.has('owner'))
      .and(sinon.match.has('number'));
    assert.alwaysCalledWithExactly(mock.pullRequests.update, request, sinon.match.func);
  }

  if (mock.pullRequests.getFiles.called) {
    request = sinon.match.has('repo')
      .and(sinon.match.has('owner'))
      .and(sinon.match.has('number'));
    assert.alwaysCalledWithExactly(mock.pullRequests.getFiles, request, sinon.match.func);
  }

};
