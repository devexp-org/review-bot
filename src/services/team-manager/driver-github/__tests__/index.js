import service from '../index';
import githubMock from '../../../github/__mocks__/index';

describe('services/team-manager/driver-github', function () {

  let options, imports, factory, github;

  beforeEach(function () {
    github = githubMock();

    options = {};
    imports = { github };
  });

  it('should be resolved to AbstractDriver', function () {
    factory = service(options, imports);

    assert.property(factory, 'makeDriver');
  });

});
