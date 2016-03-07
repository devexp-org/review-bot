import service from '../../team-static';

describe('services/team-static', function () {

  it('should be resolved to Team', function () {

    const options = {
      members: ['Iron Man', 'Thor']
    };

    const team = service(options);
    assert.property(team, 'getTeam');

  });

});
