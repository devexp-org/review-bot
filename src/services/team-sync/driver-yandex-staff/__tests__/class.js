import { YandexStaffDriverFactory } from '../class';

import { teamMock } from '../../../model/model-team/__mocks__/';
import yandexStaffMock from '../../../../plugins/yandex-staff/__mocks__/';

describe('services/team-manager/driver-yandex-staff/class', function () {

  let team, factory, driver, config, staff;

  beforeEach(function () {
    config = {
      groupId: 1
    };

    team = teamMock();

    staff = yandexStaffMock();

    factory = new YandexStaffDriverFactory(staff);
  });

  it('should be resolved to AbstractDriver', function () {
    driver = factory.makeDriver(team, config);

    assert.property(driver, 'getMembers');
  });

  it('should throw an error if `orgNmae` is not given', function () {
    assert.throws(() => factory.makeDriver(team, {}), /groupId/);
  });

  describe('#getMembers', function () {

    it('should return people in office for candidates to review', function (done) {
      const users = [{ login: 'foo' }, { login: 'bar' }];

      driver = factory.makeDriver(team, config);

      staff.getUsers
        .withArgs(['1'])
        .returns(Promise.resolve(users));

      driver.getMembers()
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
