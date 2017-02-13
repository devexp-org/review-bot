import service from '../';
import serviceMock from '../__mocks__/';

import modelMock from '../../model/__mocks__/';
import teamManagerMock from '../../team-manager/__mocks__/';
import { teamModelMock } from '../../model/model-team/__mocks__/';
import { userModelMock } from '../../model/model-user/__mocks__/';
import { abstractDriverFactoryMock as teamDriverFactoryMock }
  from '../driver-abstract/__mocks__/';

describe('services/team-sync', function () {

  let options, imports, model, teamManager;

  beforeEach(function () {
    model = modelMock();

    model
      .withArgs('team')
      .returns(teamModelMock());

    model
      .withArgs('user')
      .returns(userModelMock());

    teamManager = teamManagerMock();

    options = {};
    imports = { model, 'team-manager': teamManager };
  });

  it('the mock object should have the same methods', function (done) {
    const mock = serviceMock();
    const methods = Object.keys(mock);

    service(options, imports)
      .then(obj => methods.forEach(method => assert.property(obj, method)))
      .then(done, done);
  });

  it('should setup team sync service', function (done) {
    const factory1 = teamDriverFactoryMock();
    const factory2 = teamDriverFactoryMock();

    options.drivers = { name1: 'driver1', name2: 'driver2' };
    imports.driver1 = factory1;
    imports.driver2 = factory2;

    service(options, imports)
      .then(sync => {
        assert.deepEqual(
          sync.getDrivers(),
          { name1: factory1, name2: factory2 }
        );
      })
      .then(done, done);
  });

  it('should return an error if driver module was not given', function () {
    options.drivers = ['unknown-driver'];

    assert.throws(() => service(options, imports), /cannot find/i);
  });

});
