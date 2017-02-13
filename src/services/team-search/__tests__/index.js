import service from '../';
import serviceMock from '../__mocks__/';

describe('services/team-search', function () {

  let options, imports;

  beforeEach(function () {
    options = {
      drivers: {
        'static': 'static-driver'
      },
      defaultDriver: 'static'
    };
    imports = {
      'static-driver': sinon.stub()
    };
  });

  it('the mock object should have the same methods', function () {
    const obj = service(options, imports);
    const mock = serviceMock();
    const methods = Object.keys(mock);

    methods.forEach(method => assert.property(obj, method));
  });

  it('should throw an error if driver was not given', function () {
    options.drivers = ['unknown-driver'];

    assert.throws(() => service(options, imports), /cannot find/i);
  });

  it('should throw an error if default driver is not set', function () {
    options.defaultDriver = null;

    assert.throws(() => service(options, imports), /is not set/i);
  });

  it('should throw an error if default driver is not found', function () {
    options.defaultDriver = 'unknown-driver';

    assert.throws(() => service(options, imports), /is not found/i);
  });

});
