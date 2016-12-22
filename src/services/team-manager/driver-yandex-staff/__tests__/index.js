import service from '../';
import yandexStaffMock from '../../../../junk/yandex-staff/__mocks__/';

describe('plugins/team-manager/driver-yandex-staff', function () {

  let options, imports, factory;

  beforeEach(function () {
    options = {};
    imports = { 'yandex-staff': yandexStaffMock() };
  });

  it('should be resolved to AbstractDriver', function () {
    factory = service(options, imports);

    assert.property(factory, 'name');
    assert.property(factory, 'config');
    assert.property(factory, 'makeDriver');
  });

  describe('#name', function () {

    it('should return `yandex-staff`', function () {
      factory = service(options, imports);
      assert.equal(factory.name(), 'yandex-staff');
    });

  });

  describe('#config', function () {

    it('should return driver config', function () {
      factory = service(options, imports);
      assert.isObject(factory.config());
    });

  });

});
