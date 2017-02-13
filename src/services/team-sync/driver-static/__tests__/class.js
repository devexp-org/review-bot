import { StaticDriverFactory } from '../class';

import { teamMock, teamModelMock } from '../../../model/model-team/__mocks__/';

describe('services/team-manager/driver-static/class', function () {

  let team, TeamModel, teamDriver, factory;

  beforeEach(function () {
    team = teamMock();

    TeamModel = teamModelMock();

    factory = new StaticDriverFactory(TeamModel);

    teamDriver = factory.makeDriver(team);

    TeamModel.findByNameWithMembers
      .returns(Promise.resolve(team));
  });

  describe('#config', function () {

    it('should return driver config', function () {
      assert.isObject(factory.config());
    });

  });

  describe('#getMembers', function () {

    it('should be resolved to array', function (done) {
      teamDriver.getMembers()
        .then(members => {
          assert.isArray(members);
          assert.lengthOf(members, 0);
        })
        .then(done, done);
    });

  });

});

