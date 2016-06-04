import service from '../';
import serviceMock from '../__mocks__/';

describe('services/logger', function () {

  it('the mock object should have the same methods', function () {

    const obj = service({});
    const mock = serviceMock();
    const methods = Object.keys(mock);

    methods.forEach(method => {
      assert.property(obj, method);
    });

  });

});
