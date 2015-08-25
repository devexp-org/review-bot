import service from '../../team-static';

describe('service/team-static', function () {

  it('should be resolved to Team', function (done) {

    const options = {
      members: ['Iron Man', 'Thor']
    };

    service(options)
      .then(result => {
        const team = result.service;

        assert.property(team, 'getTeam');
        done();
      })
      .catch(done);

  });

});
