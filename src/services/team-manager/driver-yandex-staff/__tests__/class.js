import { YandexStaffDriverFactory } from '../class';

import teamManagerMock from '../../__mocks__/';
import { teamMock } from '../../../model/model-team/__mocks__/';
import yandexStaffMock from '../../../../plugins/yandex-staff/__mocks__/';

describe('services/team-manager/driver-yandex-staff/class', function () {

  let team, factory, driver, config, staff, manager;

  beforeEach(function () {
    config = {
      groupId: 1
    };

    team = teamMock();

    manager = teamManagerMock();

    staff = yandexStaffMock();

    factory = new YandexStaffDriverFactory(staff);
  });

  it('should be resolved to StaticDriver', function () {
    driver = factory.makeDriver(team, manager, config);

    assert.property(driver, 'getOption');
    assert.property(driver, 'getCandidates');
  });

  it('should throw an error if `orgNmae` is not given', function () {
    assert.throws(() => factory.makeDriver(team, manager, {}), /groupId/);
  });

  describe('#getCandidates', function () {

    it('should return people in office for candidates to review', function (done) {
      const users = [{ login: 'foo' }, { login: 'bar' }];

      driver = factory.makeDriver(team, manager, config);

      staff.getUsersInOffice
        .withArgs(1)
        .returns(Promise.resolve(users));

      driver.getCandidates()
        .then(members => assert.deepEqual(members, users))
        .then(done, done);
    });

  });

  describe('#config', function () {

    it('should return driver config', function () {
      assert.isObject(factory.config());
    });

  });

});
