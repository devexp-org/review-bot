import service from '../';
import serviceMock from '../__mocks__/';

describe('services/pull-request-github', function () {

  let options, imports, github;

  beforeEach(function () {
    github = sinon.stub();

    options = {};
    imports = { github };
  });

  it('the mock object should have the same methods', function () {

    const obj = service(options, imports);
    const mock = serviceMock();
    const methods = Object.keys(mock);

    methods.forEach(method => {
      assert.property(obj, method);
    });

  });

});
