import service from '../addon';

describe('services/pull-request-github/addon', function () {

  describe('#extender', function () {

    it('should return patial schema', function () {

      const addon = service();

      assert.isObject(addon);
      assert.isFunction(addon.extender);

      const extender = addon.extender();
      assert.property(extender, 'section');

    });

  });

});
