import { StaticDriverFactory } from '../class';

import { teamMock, teamModelMock } from '../../../model/model-team/__mocks__/';

describe('services/team-manager/driver-static/class', function () {

  let team, teamModel, teamDriver, factory;

  beforeEach(function () {
    team = teamMock();

    teamModel = teamModelMock();

    factory = new StaticDriverFactory(teamModel);

    teamDriver = factory.makeDriver(team);

    teamModel.findByNameWithMembers
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

  describe('#getOption', function () {

    beforeEach(function () {
      team.reviewConfig = { foo: 'bar' };

      teamDriver = factory.makeDriver(team);
    });

    it('should return team option', function () {
      assert.equal(teamDriver.getOption('foo'), 'bar');
    });

    it('should return default option if team option is undefined', function () {
      assert.equal(teamDriver.getOption('bar', 'baz'), 'baz');
    });

  });

});

