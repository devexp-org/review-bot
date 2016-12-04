import service from '../';
import serviceMock from '../__mocks__/';

import modelMock from '../../model/__mocks__/';
import { teamModelMock } from '../../model/model-team/__mocks__/';

describe('services/team-manager', function () {

  let options, imports;

  beforeEach(function () {
    options = {};
    imports = {};
  });

  it('the mock object should have the same methods', function () {
    const model = modelMock();
    model
      .withArgs('team')
      .returns(teamModelMock());

    imports.model = model;

    const obj = service(options, imports);
    const mock = serviceMock();
    const methods = Object.keys(mock);

    methods.forEach(method => assert.property(obj, method));

  });

});
