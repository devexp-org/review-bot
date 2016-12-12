import service from '../index';
import staffMock from '../../../../plugins/yandex-staff/__mocks__/index';

describe('plugins/team-dispatcher/yandex', function () {

  let team, staff, options, imports;

  beforeEach(function () {

    staff = staffMock();

    options = {};
    imports = { 'yandex-staff': staff };

  });

  it('should be resolved to Team', function () {

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
