import service from '../index';
import startrekMock from '../__mocks__/index';

describe('plugins/startrek', function () {

  const methods = [
    'parseIssue',
    'issueUpdate',
    'issueStatusChange'
  ];

  it('should be resolved to StarTrek', function () {
    const startrek = service();

    methods.forEach(function (method) {
      assert.property(startrek, method);
    });
  });

  it('the mock object should have the same methods', function () {
    const mock = startrekMock();

    methods.forEach(function (method) {
      assert.property(mock, method);
    });
  });

});
