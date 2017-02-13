import service from '../index';
import modelMock from '../../../model/__mocks__/index';

describe('services/team-manager/driver-static', function () {

  let options, imports, factory, model;

  beforeEach(function () {
    model = modelMock();

    options = {};
    imports = { model };
  });

  it('should be resolved to StaticDriverFactory', function () {
    factory = service(options, imports);

    assert.property(factory, 'config');
    assert.property(factory, 'makeDriver');
  });

});
