import service from '../addon';
import schemaMock from '../../model/__mocks__/schema';
import staticMock from '../../model/__mocks__/static';

describe('services/pull-request-review/addon', function () {

  let options, imports, model;

  beforeEach(function () {
    model = schemaMock();

    options = {};
    imports = {};
  });

  describe('#mixin', function () {

    let addon, staticStub;

    beforeEach(function () {
      addon = service(options, imports);
      addon.mixin(model);

      staticStub = staticMock();
    });

    it('should add stattic method "findInReview"', function () {
      model.statics.findInReview.call(staticStub);
    });

    it('#should add static method "findByReviewer"', function () {
      model.statics.findByReviewer.call(staticStub);
    });

    it('#should add static method "findInReviewByReviewer"', function () {
      model.statics.findInReviewByReviewer.call(staticStub);
    });

  });

  describe('#extender', function () {

    it('should return patial schema', function () {
      const addon = service(options, imports);

      assert.isObject(addon);
      assert.isFunction(addon.extender);

      const extender = addon.extender();
      assert.property(extender, 'review');
    });

  });

});
