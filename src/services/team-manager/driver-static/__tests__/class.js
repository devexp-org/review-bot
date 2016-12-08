import { StaticDriverFactory } from '../class';

import { teamMock } from '../../../model/model-team/__mocks__/';

describe('services/team-manager/driver-static', function () {

  let team, driver, factory;

  beforeEach(function () {
    team = teamMock();

    factory = new StaticDriverFactory();

    driver = factory.makeDriver(team);
  });

  describe('#getCandidates', function () {

    it('should be resolved to array', function (done) {
      driver.getCandidates()
        .then(members => {
          assert.isArray(members);
          assert.lengthOf(members, 0);
        })
        .then(done, done);
    });

  });

  describe('#findTeamMember', function () {

    it('should find member by login', function (done) {
      sinon.stub(driver, 'getCandidates')
        .returns(Promise.resolve([
          { id: 1, login: 'a' },
          { id: 2, login: 'b' },
          { id: 3, login: 'c' }
        ]));

      driver.findTeamMember(null, 'b')
        .then(member => assert.deepEqual(member, { id: 2, login: 'b' }))
        .then(done, done);
    });

  });

  describe('#getOption', function () {

    beforeEach(function () {
      team.reviewConfig = { foo: 'bar' };

      driver = factory.makeDriver(team);
    });

    it('should return team option', function () {
      assert.equal(driver.getOption('foo'), 'bar');
    });

    it('should return default option if team option is undefined', function () {
      assert.equal(driver.getOption('bar', 'baz'), 'baz');
    });

  });

});

