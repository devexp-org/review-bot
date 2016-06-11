import service from '../';
import staffMock from '../../staff/__mocks__/';

describe('plugins/team-dispatcher/staff', function () {

  let team, staff, options, imports;

  beforeEach(function () {

    staff = staffMock();

    options = {};
    imports = { staff };

  });

  it('should be resolved to AbstractTeam', function () {

    team = service(options, imports);

    assert.property(team, 'getOption');
    assert.property(team, 'findTeamMember');
    assert.property(team, 'getMembersForReview');

  });

  it('should set options for team', function () {
    options = { overrides: { approveCount: 10 } };

    team = service(options, imports);

    assert.equal(team.getOption('approveCount'), 10);
  });

});
