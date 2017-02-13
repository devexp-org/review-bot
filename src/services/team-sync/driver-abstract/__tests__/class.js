import { AbstractDriver, AbstractDriverFactory } from '../class';

import { teamMock } from '../../../model/model-team/__mocks__/';

describe('services/team-manager/driver-abstract/class', function () {

  let team, factory, teamDriver;

  beforeEach(function () {
    team = teamMock();

    factory = new AbstractDriverFactory();

    teamDriver = new AbstractDriver(team, {});
  });

  describe('#config', function () {

    it('should return a driver config', function () {
      assert.isObject(factory.config());
    });

  });

  describe('#makeDriver', function () {

    it('should throw an error', function () {
      assert.throws(() => factory.makeDriver(), /abstract method/);
    });

  });

  describe('#getMembers', function () {

    it('should reject promise', function (done) {
      teamDriver.getMembers()
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /abstract method/))
        .then(done, done);
    });

  });

});
