import service from '../index';
import githubMock from '../../../github/__mocks__/index';

describe('services/team-dispatcher/github', function () {

  let options, imports, team;

  beforeEach(function () {
    options = {
      orgName: 'nodejs'
    };

    imports = {
      github: githubMock()
    };
  });

  it('should be resolved to AbstractTeam', function () {
    team = service(options, imports);

    assert.property(team, 'getOption');
    assert.property(team, 'findTeamMember');
    assert.property(team, 'getMembersForReview');
  });

  it('should pass team options', function () {
    options.overrides = { approveCount: 10 };

    team = service(options, imports);

    assert.equal(team.getOption('approveCount'), 10);
  });

});
