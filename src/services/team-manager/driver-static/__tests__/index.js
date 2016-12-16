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

    assert.property(factory, 'name');
    assert.property(factory, 'config');
    assert.property(factory, 'makeDriver');
  });

  describe('#name', function () {

    it('should return `static`', function () {
      factory = service(options, imports);
      assert.equal(factory.name(), 'static');
    });

  });

  describe('#config', function () {

    it('should return driver config', function () {
      factory = service(options, imports);
      assert.isObject(factory.config());
    });

  });

});
