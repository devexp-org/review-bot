import service from '../';
import serviceMock from '../__mocks__/';

import modelMock from '../../model/__mocks__/';
import { teamModelMock } from '../../model/model-team/__mocks__/';

describe('services/team-manager', function () {

  let options, imports, model;

  beforeEach(function () {
    model = modelMock();

    model
      .withArgs('team')
      .returns(teamModelMock());

    options = {};
    imports = { model };
  });

  it('the mock object should have the same methods', function () {
    const obj = service(options, imports);
    const mock = serviceMock();
    const methods = Object.keys(mock);

    methods.forEach(method => assert.property(obj, method));
  });

  it('should throw an error if driver module was not given', function () {
    options.drivers = ['unknown-driver'];

    assert.throws(() => service(options, imports), /cannot find/i);
  });

});
