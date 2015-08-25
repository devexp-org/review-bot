import service from '../../team-github';

describe('service/team-github', function () {

  it('should be resolved to Team', function (done) {

    const options = {};
    const imports = {
      github: sinon.stub()
    };

    service(options, imports)
      .then(result => {
        const team = result.service;

        assert.property(team, 'getTeam');
        done();
      })
      .catch(done);

  });

});
