import service from '../';
import yandexStaffMock from '../../../../plugins/yandex-staff/__mocks__/';

describe('plugins/team-manager/driver-yandex-multimedia', function () {

  let options, imports, factory;

  beforeEach(function () {
    options = {};
    imports = { 'yandex-staff': yandexStaffMock() };
  });

  it('should be resolved to AbstractDriver', function () {
    factory = service(options, imports);

    assert.property(factory, 'config');
    assert.property(factory, 'makeDriver');
  });

});
