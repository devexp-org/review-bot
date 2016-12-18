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

  describe('#getCandidates', function () {

    it('should be resolved to array', function (done) {
      teamDriver.getCandidates()
        .then(members => {
          assert.isArray(members);
          assert.lengthOf(members, 0);
        })
        .then(done, done);
    });

  });

  describe('#findTeamMember', function () {

    it('should find member by login', function (done) {
      sinon.stub(teamDriver, 'getCandidates')
        .returns(Promise.resolve([
          { id: 1, login: 'a' },
          { id: 2, login: 'b' },
          { id: 3, login: 'c' }
        ]));

      teamDriver.findTeamMember('b')
        .then(member => assert.deepEqual(member, { id: 2, login: 'b' }))
        .then(done, done);
    });

  });

  describe('#name', function () {

    it('should return `static`', function () {
      assert.equal(factory.name(), 'static');
    });

  });

  describe('#config', function () {

    it('should return driver config', function () {
      assert.isObject(factory.config());
    });

  });

});

