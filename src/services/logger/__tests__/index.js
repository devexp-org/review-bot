import service from '../';
import serviceMock from '../__mocks__/';

describe('services/logger', function () {

  let options, imports;

  it('the mock object should have the same methods', function () {
    options = {};
    const obj = service(options, imports);
    const mock = serviceMock();
    const methods = Object.keys(mock);

    methods.forEach(method => assert.property(obj, method));
  });

});
