import service from '../';
import modelMock from '../../model/__mocks__/';

describe('services/pull-request-model', function () {

  let options, imports;

  it('should be resolved to PullRequestModel', function () {

    options = {};
    imports = { model: modelMock() };

    const model = service(options, imports);

    assert.property(model, 'findById');
    assert.property(model, 'findByUser');
    assert.property(model, 'findByReviewer');
    assert.property(model, 'findInReviewByReviewer');
    assert.property(model, 'findByRepositoryAndNumber');

  });

});
