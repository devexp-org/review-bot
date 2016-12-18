import { AbstractDriver, AbstractDriverFactory } from '../class';

import { teamMock } from '../../../model/model-team/__mocks__/';

describe('services/team-manager/driver-abstract/class', function () {

  let team, factory, teamDriver;

  beforeEach(function () {
    team = teamMock();

    factory = new AbstractDriverFactory();

    teamDriver = new AbstractDriver(team, {});
  });

  describe('#makeDriver', function () {

    it('should throw an error', function () {
      assert.throws(() => factory.makeDriver(), /abstract method/);
    });

  });

  describe('#getCandidates', function () {

    it('should reject promise', function (done) {
      teamDriver.getCandidates()
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /abstract method/))
        .then(done, done);
    });

  });

  describe('#findTeamMember', function () {

    it('should reject promise', function (done) {
      teamDriver.findTeamMember('foo')
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /abstract method/))
        .then(done, done);
    });

  });

  describe('#getOption', function () {

    beforeEach(function () {
      team.reviewConfig = { foo: 'bar' };

      teamDriver = new AbstractDriver(team, {});
    });

    it('should return team option', function () {
      assert.equal(teamDriver.getOption('foo'), 'bar');
    });

    it('should return default option if team option is undefined', function () {
      assert.equal(teamDriver.getOption('bar', 'baz'), 'baz');
    });

  });

  describe('#name', function () {

    it('should return `github`', function () {
      assert.equal(factory.name(), '');
    });

  });

  describe('#config', function () {

    it('should return driver config', function () {
      assert.isObject(factory.config());
    });

  });

});
