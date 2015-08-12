'use strict';

import GitHubTeam from '../github';

describe('modules/team/github', function () {

  let github;

  const pull = {
    organization: {
      login: 'devexp-org'
    }
  };

  beforeEach(function () {
    github = {
      orgs: {
        getTeams: sinon.stub(),
        getMembers: sinon.stub(),
        getTeamMembers: sinon.stub()
      }
    };
  });

  afterEach(function () {
    github = null;
  });

  it('should use method `getMembers` to obtain team if no slug name was given', function (done) {
    const gt = new GitHubTeam(github);
    const teamPromise = gt.getTeam(pull);

    setTimeout(function () {
      github.orgs.getMembers.callArgWith(1, null, []);
    }, 0);

    teamPromise
      .then(() => {
        assert.calledWith(
          github.orgs.getMembers,
          { org: 'devexp-org', per_page: 100 }
        );
        done();
      })
      .catch(done);
  });

  it('should use method `getTeamMembers` to obtain team if slug name was given', function (done) {
    const gt = new GitHubTeam(github, 'devs');
    const teamPromise = gt.getTeam(pull);

    setTimeout(function () {
      github.orgs.getTeams.callArgWith(1, null, [{ id: 42, slug: 'devs' }]);
    }, 0);

    setTimeout(function () {
      github.orgs.getTeamMembers.callArgWith(1, null, []);
    }, 10);

    teamPromise
      .then(() => {
        assert.calledWith(
          github.orgs.getTeamMembers,
          { id: 42, per_page: 100 }
        );
        done();
      })
      .catch(done);
  });

  describe('#getOrgMembers', function () {

    it('should return rejected promise if github return error', function (done) {
      const gt = new GitHubTeam(github, 'devs');
      const teamPromise = gt.getOrgMembers('github');

      github.orgs.getMembers.callArgWith(1, new Error('error'));

      teamPromise.catch(error => { done(); });
    });

  });

  describe('#getTeamMembers', function () {

    it('should return rejected promise if github return error', function (done) {
      const gt = new GitHubTeam(github, 'devs');
      const teamPromise = gt.getTeamMembers(1);

      github.orgs.getTeamMembers.callArgWith(1, new Error('error'));

      teamPromise.catch(error => { done(); });
    });

  });

  describe('#getTeamId', function () {

    it('should return rejected promise if github return error', function (done) {
      const gt = new GitHubTeam(github, 'devs');
      const teamPromise = gt.getTeamId('github', 'devs');

      github.orgs.getTeams.callArgWith(1, new Error('error'));

      teamPromise.catch(error => { done(); });
    });

    it('should return rejected promise if team not found', function (done) {
      const gt = new GitHubTeam(github, 'devs');
      const teamPromise = gt.getTeamId('github', 'devs');

      github.orgs.getTeams.callArgWith(1, null, []);

      teamPromise.catch(error => {
        assert.match(error.message, /not found/);
        done();
      });
    });

  });

});
