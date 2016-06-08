import service from '../addon';
import schemaMock from '../../../services/model/__mocks__/schema';

describe('plugins/complexity/addon', function () {

  let options, imports, model;

  beforeEach(function () {
    model = schemaMock();

    options = {};
    imports = {};
  });

  describe('#mixin', function () {

    it('should setup save hook', function (done) {

      const addon = service(options, imports);

      const context = {
        additions: 100,
        deletions: 20,
        commits: 1
      };

      addon.mixin(model);

      model.pre.callArgOnWith(1, context, function () {
        assert.equal(context.complexity, 25);
        done();
      });

    });

  });

  describe('#extender', function () {

    it('should return patial schema', function () {
      const addon = service(options, imports);
      const extender = addon.extender();

      assert.isObject(extender);
    });

  });

});
