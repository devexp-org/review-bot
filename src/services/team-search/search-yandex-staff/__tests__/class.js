import YandexStaffSearch from '../class';
import yandexStaffMock from '../../../../plugins/yandex-staff/__mocks__/';

describe('services/team-search/search-yandex-staff/class', function () {

  let search, staff;

  beforeEach(function () {
    staff = yandexStaffMock();

    search = new YandexStaffSearch(staff);
  });

  describe('#findByLogin', function () {

    it('should search user in staff', function (done) {
      const fooUser = { login: 'foo' };

      staff.apiUserInfo
        .withArgs('foo')
        .returns(Promise.resolve(fooUser));

      staff._addAvatarAndUrl
        .returnsArg(0);

      search.findByLogin('foo')
        .then(user => assert.propertyVal(fooUser, 'login', 'foo'))
        .then(done, done);
    });

  });

});
