'use strict';

import Team from '../../team';

describe('modules/team', () => {

  const pull = {
    repository: { full_name: 'devexp-org/devexp' }
  };

  const methods = ['findByPullRequest', 'findTeamMemberByPullRequest'];

  let getData1;
  let getData2;
  let getData3;

  beforeEach(() => {
    getData1 = sinon.stub().returns(Promise.resolve());
    getData2 = sinon.stub().returns(Promise.resolve());
    getData3 = sinon.stub().returns(Promise.resolve());
  });

  methods.forEach(method => {

    describe('#' + method, () => {

      it('should use the first matched route', () => {
        const routes = [
          { pattern: 'otherorg-org/devexp', getTeam: getData1 },
          { pattern: 'devexp-org/devexp', getTeam: getData2 },
          { pattern: '*', getTeam: getData3 }
        ];

        (new Team(routes))[method](pull);

        assert.called(getData2);
        assert.notCalled(getData1);
        assert.notCalled(getData3);
      });

      it('should interpret "*" as "always match"', () => {
        const routes = [
          { pattern: '*', getTeam: getData1 }
        ];

        new Team(routes)[method](pull);

        assert.called(getData1);
      });

      it('should understand wildcard', () => {
        const routes = [
          { pattern: 'devexp-*/*', getTeam: getData1 }
        ];

        new Team(routes)[method](pull);

        assert.called(getData1);
      });

      it('should not throw an error if routes does not provied', () => {
        const team = new Team();
        assert.doesNotThrow(team[method].bind(team, pull));
      });

    });

  });

  describe('#findByPullRequest', () => {
    it('should return an empty array if there are no matched routes', () => {
      const routes = [
        { pattern: 'other-org/other-repo', getTeam: getData1 }
      ];

      const team = new Team(routes).findByPullRequest(pull);

      assert.lengthOf(team, 0);
      assert.notCalled(getData1);
    });
  });

  describe('#findTeamMemberByPullRequest', () => {
    it('should return an null if there are no matched routes', () => {
      const routes = [
        { pattern: 'other-org/other-repo', getTeam: getData1 }
      ];

      const team = new Team(routes).findTeamMemberByPullRequest(pull);

      assert.isNull(team);
      assert.notCalled(getData1);
    });
  });

  describe('#findTeamNameByPullRequest', () => {

    it('should use the first matched route', () => {
      const routes = [
        { team: 'team1', pattern: 'otherorg-org/devexp', getTeam: getData1 },
        { team: 'team2', pattern: 'devexp-org/devexp', getTeam: getData2 },
        { team: 'team3', pattern: '*', getTeam: getData3 }
      ];

      const name = (new Team(routes)).findTeamNameByPullRequest(pull);

      assert.equal(name, 'team2');
    });

    it('should interpret "*" as "always match"', () => {
      const routes = [
        { team: 'team_any', pattern: '*', getTeam: getData1 }
      ];

      const name = (new Team(routes)).findTeamNameByPullRequest(pull);

      assert.equal(name, 'team_any');
    });

    it('should understand wildcard', () => {
      const routes = [
        { team: 'team_devexp', pattern: 'devexp-*/*', getTeam: getData1 }
      ];

      const name = (new Team(routes)).findTeamNameByPullRequest(pull);

      assert.equal(name, 'team_devexp');
    });

    it('should not throw an error if routes does not provied', () => {
      const team = new Team();
      assert.doesNotThrow(team.findTeamNameByPullRequest.bind(team, pull));
    });

    it('should return an null if there are no matched routes', () => {
      const routes = [
        { pattern: 'other-org/other-repo', getTeam: getData1 }
      ];

      const team = new Team(routes).findTeamNameByPullRequest(pull);

      assert.isNull(team);
      assert.notCalled(getData1);
    });
  });

});
