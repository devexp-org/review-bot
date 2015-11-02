'use strict';

import Team from '../../team';

describe('modules/team', () => {

  const pull = {
    repository: { full_name: 'devexp-org/devexp' }
  };

  const methods = ['findByPullRequest', 'findTeamMemberByPullRequest'];

  methods.forEach(method => {

    describe('#' + method, () => {
      let getData1;
      let getData2;
      let getData3;

      beforeEach(() => {
        getData1 = sinon.stub();
        getData2 = sinon.stub();
        getData3 = sinon.stub();
      });

      it('should use the first matched route', () => {
        const routes = [
          { pattern: 'otherorg-org/devexp', getTeam: getData1, getMember: getData1 },
          { pattern: 'devexp-org/devexp', getTeam: getData2, getMember: getData2 },
          { pattern: '*', getTeam: getData3, getMember: getData3 }
        ];

        (new Team(routes))[method](pull);

        assert.called(getData2);
        assert.notCalled(getData1);
        assert.notCalled(getData3);
      });

      it('should interpret "*" as "always match"', () => {
        const routes = [
          { pattern: '*', getTeam: getData1, getMember: getData1 }
        ];

        new Team(routes)[method](pull);

        assert.called(getData1);
      });

      it('should understand wildcard', () => {
        const routes = [
          { pattern: 'devexp-*/*', getTeam: getData1, getMember: getData1 }
        ];

        new Team(routes)[method](pull);

        assert.called(getData1);
      });

      it('should return an empty array if there are no matched routes', () => {
        const routes = [
          { pattern: 'other-org/other-repo', getTeam: getData1, getMember: getData1 }
        ];

        const team = new Team(routes)[method](pull);

        assert.lengthOf(team, 0);
        assert.notCalled(getData1);
      });

      it('should not throw an error if routes does not provied', () => {
        const team = new Team();
        assert.doesNotThrow(team[method].bind(team, pull));
      });

    });

  });

});
