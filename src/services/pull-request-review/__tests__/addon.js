import service from '../addon';
import schemaMock from '../../model/__mocks__/schema';
import staticMock from '../../model/__mocks__/static';

describe('services/pull-request-review/addon', function () {

  let model, plugin, staticStub;

  beforeEach(function () {
    model = schemaMock();

    plugin = service();

    staticStub = staticMock();

    plugin(model);
  });

  it('should add static method "findInReview"', function () {
    model.statics.findInReview.call(staticStub);
  });

  it('#should add static method "findByReviewer"', function () {
    model.statics.findByReviewer.call(staticStub);
  });

  it('#should add static method "findInReviewByReviewer"', function () {
    model.statics.findInReviewByReviewer.call(staticStub);
  });

});
