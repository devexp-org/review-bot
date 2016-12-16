import service from '../index';
import modelMock from '../../../model/__mocks__/index';
import githubMock from '../../../github/__mocks__/index';

describe('services/team-manager/driver-github', function () {

  let options, imports, factory, github, model;

  beforeEach(function () {
    model = modelMock();
    github = githubMock();

    options = {};
    imports = { model, github };
  });

  it('should be resolved to StaticDriverFactory', function () {
    factory = service(options, imports);

    assert.property(factory, 'name');
    assert.property(factory, 'config');
    assert.property(factory, 'makeDriver');
  });

  describe('#name', function () {

    it('should return `github`', function () {
      factory = service(options, imports);
      assert.equal(factory.name(), 'github');
    });

  });

  describe('#config', function () {

    it('should return driver config', function () {
      factory = service(options, imports);
      assert.isObject(factory.config());
    });

  });

});
