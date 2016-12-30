import service from '../';
import serviceMock, { transportMock } from '../__mocks__/';

describe('services/notification', function () {

  let options, imports;

  it('the mock object should have the same methods', function () {
    options = {};
    imports = {};

    const obj = service(options, imports);
    const mock = serviceMock();
    const methods = Object.keys(mock);

    methods.forEach(method => assert.property(obj, method));
  });

  it('should setup a notification', function () {
    const transport1 = transportMock();
    const transport2 = transportMock();

    options.transports = { name1: 'transport1', name2: 'transport2' };
    imports.transport1 = transport1;
    imports.transport2 = transport2;

    const notification = service(options, imports);

    assert.deepEqual(
      notification.getTransports(),
      { name1: transport1, name2: transport2 }
    );
  });

  it('should throw an error if transport module was not given', function () {
    options.transports = ['unknown-transport'];

    assert.throws(() => service(options, imports), /cannot find/i);
  });

});
