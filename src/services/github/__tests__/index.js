import proxyquire from 'proxyquire';

import service from '../';
import serviceMock from '../__mocks__/';

describe('services/github', function () {

  let options, imports;

  it('the mock object should have the same methods', function () {
    options = {
      version: '3.0.0'
    };

    const obj = service(options, imports);
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
      auth: {
        type: 'token',
        token: '1234567890abcde'
      }
    };

    service(options);

    assert.called(authenticateStub);
  });

});
