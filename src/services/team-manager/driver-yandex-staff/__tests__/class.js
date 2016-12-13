import { YandexStaffDriverFactory } from '../class';

import yandexStaffMock from '../../../../plugins/yandex-staff/__mocks__/';
import { teamMock } from '../../../model/model-team/__mocks__/';

describe('services/team-manager/driver-yandex-staff/class', function () {

  let team, factory, driver, config, yandexStaff;

  beforeEach(function () {
    config = {
      groupId: 1
    };

    team = teamMock();

    yandexStaff = yandexStaffMock();

    factory = new YandexStaffDriverFactory(yandexStaff);
  });

  it('should be resolved to AbstractDriver', function () {
    driver = factory.makeDriver(team, config);

    assert.property(driver, 'getOption');
    assert.property(driver, 'getCandidates');
    assert.property(driver, 'findTeamMember');
  });

  it('should throw an error if `orgNmae` is not given', function () {
    assert.throws(() => factory.makeDriver(team, {}), /groupId/);
  });

  describe('#getCandidates', function () {

    it('should return people in office for members for review', function (done) {
      const users = [{ login: 'foo' }, { login: 'bar' }];

      driver = factory.makeDriver(team, config);

      yandexStaff.getUsersInOffice
        .withArgs(1)
        .returns(Promise.resolve(users));

      driver.getCandidates()
        .then(members => assert.deepEqual(members, users))
        .then(done, done);
    });

  });

  describe('#findTeamMember', function () {

    it('should search user in yandex staff', function (done) {
      const fooUser = { login: 'foo' };

      driver = factory.makeDriver(team, config);

      yandexStaff.apiUserInfo
        .withArgs('foo')
        .returns(Promise.resolve(fooUser));

      yandexStaff._addAvatarAndUrl
        .returnsArg(0);

      driver.findTeamMember('foo')
        .then(user => assert.deepEqual(user, fooUser))
        .then(done, done);
    });

  });

});
