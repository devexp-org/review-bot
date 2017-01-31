import service from '../';
import yandexStaffMock from '../../../../plugins/yandex-staff/__mocks__/';

describe('services/team-manager/search-yandex-staff', function () {

  let options, imports, search;

  beforeEach(function () {
    options = {};
    imports = { 'yandex-staff': yandexStaffMock() };
  });

  it('should be resolved to AbstractSearch', function () {
    search = service(options, imports);

    assert.property(search, 'findUser');
  });

});
