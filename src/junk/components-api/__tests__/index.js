import service from '../index';
import eventsMock from '../__mocks__/index';

describe('plugins/components-api', function () {

  const methods = [
    'getResponsibles'
  ];

  it('should be resolved to ComponentsAPI', function () {
    const emitter = service();

    methods.forEach(function (method) {
      assert.property(emitter, method);
    });
  });

  it('the mock object should have the same methods', function () {
    const mock = eventsMock();

    methods.forEach(function (method) {
      assert.property(mock, method);
    });
  });

});
