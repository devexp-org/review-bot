import { AbstractDriver, AbstractDriverFactory } from '../class';

import teamManagerMock from '../../__mocks__/';
import { teamMock } from '../../../model/model-team/__mocks__/';

describe('services/team-manager/driver-abstract/class', function () {

  let team, factory, teamDriver, manager;

  beforeEach(function () {
    team = teamMock();

    manager = teamManagerMock();

    factory = new AbstractDriverFactory();

    teamDriver = new AbstractDriver(team, manager, {});
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

    it('should proxy method to manager ', function (done) {
      teamDriver.findTeamMember('foo')
        .then(() => assert.calledWith(manager.findTeamMember, 'foo'))
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

  describe('#config', function () {

    it('should return driver config', function () {
      assert.isObject(factory.config());
    });

  });

});
