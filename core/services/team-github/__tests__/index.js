import service from '../../team-github';

describe('services/team-github', function () {

  it('should be resolved to Team', function () {

    const options = {};
    const imports = {
      github: sinon.stub()
    };

    const team = service(options, imports);
    assert.property(team, 'getTeam');
  });

});
