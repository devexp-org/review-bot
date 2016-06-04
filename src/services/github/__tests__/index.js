import proxyquire from 'proxyquire';

import service from '../';
import serviceMock from '../__mocks__/';

describe('services/github', function () {

  it('the mock object should have the same methods', function () {
    const options = {
      version: '3.0.0'
    };

    const obj = service(options);
    const mock = serviceMock();
    const methods = Object.keys(mock);

    methods.forEach(method => {
      assert.property(obj, method);
    });

  });

  it('should authenticate to GitHub if credentials was given', function () {
    const authenticateStub = sinon.stub();

    const service = proxyquire('../', {
      github: function () {
        return {
          authenticate: authenticateStub
        };
      }
    }).default;

    const options = {
      authenticate: {
        type: 'token',
        token: '1234567890abcde'
      }
    };

    service(options);

    assert.called(authenticateStub);
  });

});
