import { YandexStaffDriverFactory } from '../class';

import { teamMock } from '../../../model/model-team/__mocks__/';
import yandexStaffMock from '../../../../junk/yandex-staff/__mocks__/';

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

  it('should be resolved to StaticDriver', function () {
    driver = factory.makeDriver(team, config);

    assert.property(driver, 'getOption');
    assert.property(driver, 'getCandidates');
    assert.property(driver, 'findTeamMember');
  });

  it('should throw an error if `orgNmae` is not given', function () {
    assert.throws(() => factory.makeDriver(team, {}), /groupId/);
  });

  describe('#getCandidates', function () {

    it('should return people in office for candidates to review', function (done) {
      const users = [{ login: 'foo' }, { login: 'bar' }];

      driver = factory.makeDriver(team, config);

      staff.getUsersInOffice
        .withArgs(1)
        .returns(Promise.resolve(users));

      driver.getCandidates()
        .then(members => assert.deepEqual(members, users))
        .then(done, done);
    });

  });

  describe('#findTeamMember', function () {

    it('should search user in staff', function (done) {
      const fooUser = { login: 'foo' };

      driver = factory.makeDriver(team, config);

      staff.apiUserInfo
        .withArgs('foo')
        .returns(Promise.resolve(fooUser));

      staff._addAvatarAndUrl
        .returnsArg(0);

      driver.findTeamMember('foo')
        .then(user => assert.deepEqual(user, fooUser))
        .then(done, done);
    });

  });

});
