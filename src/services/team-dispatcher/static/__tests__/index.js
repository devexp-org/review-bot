import service from '../';

describe('services/team-dispatcher/static', function () {

  let options, team;

  it('should be resolved to AbstractTeam', function () {
    options = { members: [{ login: 'A' }] };

    team = service(options);

    assert.property(team, 'getOption');
    assert.property(team, 'findTeamMember');
    assert.property(team, 'getMembersForReview');
  });

  it('should pass team options', function () {
    options = {
      members: [{ login: 'A' }],
      overrides: { approveCount: 10 }
    };

    team = service(options);

    assert.equal(team.getOption('approveCount'), 10);
  });

});
