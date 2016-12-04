import service from '../';
import modelMock from '../../model/__mocks__/';
import { pullRequestModelMock } from '../../model/model-pull-request/__mocks__/';

describe('services/pull-request-model', function () {

  let model, options, imports, pullRequestModel;

  it('should be resolved to PullRequestModel', function () {

    model = modelMock();

    pullRequestModel = pullRequestModelMock();

    model
      .withArgs('pull_request')
      .returns(pullRequestModel);

    options = {};

    imports = { model };

    assert.equal(service(options, imports), pullRequestModel);

  });

});
