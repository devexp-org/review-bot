import service from '../';
import serviceMock from '../__mocks__/';

import modelMock from '../../model/__mocks__/';
import { teamModelMock } from '../../model/model-team/__mocks__/';
import { teamDriverFactoryMock } from '../__mocks__/';

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

  it('should setup a team manager', function () {
    const factory1 = teamDriverFactoryMock();
    factory1.name.returns('name1');

    const factory2 = teamDriverFactoryMock();
    factory2.name.returns('name2');

    options.drivers = { name1: 'driver1', name2: 'driver2' };
    imports.driver1 = factory1;
    imports.driver2 = factory2;

    const manager = service(options, imports);

    assert.deepEqual(
      manager.getDrivers(),
      { name1: factory1, name2: factory2 }
    );
  });

  it('should throw an error if driver module was not given', function () {
    options.drivers = ['unknown-driver'];

    assert.throws(() => service(options, imports), /cannot find/i);
  });

});
