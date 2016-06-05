import GitHubTeam from '../class';
import githubMock from '../../../github/__mocks__/';

describe('services/team-dispatcher/github/class', function () {

  let github;

  beforeEach(function () {
    github = githubMock();
  });

  it('should throw an error if `orgNmae` is not given', function () {
    assert.throws(() => new GitHubTeam(github), /orgName/);
  });

  it('should use method `getMembers` to obtain team if slug is not given', function (done) {
    github.orgs.getMembers.callsArgWith(1, null, []);

    const team = new GitHubTeam(github, 'nodejs');

    team.getMembersForReview()
      .then(() => assert.calledWith(
        github.orgs.getMembers,
        sinon.match({ org: 'nodejs' })
      ))
      .then(done, done);
  });

  it('should use method `getTeamMembers` to obtain team if slug is given', function (done) {
    github.orgs.getTeams
      .callsArgWith(1, null, [{ id: 42, slug: 'devs' }]);
    github.orgs.getTeamMembers
      .callsArgWith(1, null, []);

    const team = new GitHubTeam(github, 'nodejs', 'devs');

    team.getMembersForReview()
      .then(() => assert.calledWith(
        github.orgs.getTeamMembers,
        sinon.match({ id: 42 })
      ))
      .then(done, done);
  });

  describe('#getTeamId', function () {

    it('should rejected promise if github return error', function (done) {
      github.orgs.getTeams
        .callsArgWith(1, new Error('just error'));

      const team = new GitHubTeam(github, 'nodejs', 'devs');

      team.getTeamId('github', 'devs')
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /just error/))
        .then(done, done);
    });

    it('should rejected promise if team is not found', function (done) {
      github.orgs.getTeams
        .callsArgWith(1, null, []);

      const team = new GitHubTeam(github, 'nodejs', 'devs');

      team.getTeamId('github', 'devs')
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /not found/))
        .then(done, done);
    });

  });

  describe('#getMembersByOrgName', function () {

    it('should rejected promise if github return error', function (done) {
      github.orgs.getMembers
        .callsArgWith(1, new Error('just error'));

      const team = new GitHubTeam(github, 'nodejs', 'devs');

      team.getMembersByOrgName('github')
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /just error/))
        .then(done, done);
    });

  });

  describe('#getMembersByTeamId', function () {

    it('should rejected promise if github return error', function (done) {
      github.orgs.getTeamMembers
        .callsArgWith(1, new Error('just error'));

      const team = new GitHubTeam(github, 'nodejs', 'devs');

      team.getMembersByTeamId(1)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /just error/))
        .then(done, done);
    });

  });

});
