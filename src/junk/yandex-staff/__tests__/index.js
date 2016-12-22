import service from '../index';
import staffMock from '../__mocks__/index';

describe('plugins/yandex-staff', function () {

  const methods = [
    'getUsers',
    'apiAbsence',
    'apiUserInfo',
    'getUsersInOffice'
  ];

  it('should be resolved to YandexStaff', function () {
    const staff = service();

    methods.forEach(function (method) {
      assert.property(staff, method);
    });
  });

  it('the mock object should have the same methods', function () {
    const mock = staffMock();

    methods.forEach(function (method) {
      assert.property(mock, method);
    });
  });

});
