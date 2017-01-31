import service from '../';

import githubMock from '../../../github/__mocks__/';

describe('services/team-manager/search-github', function () {

  let options, imports, search;

  beforeEach(function () {
    options = {};
    imports = { github: githubMock() };
  });

  it('should be resolved to AbstractSearch', function () {
    search = service(options, imports);

    assert.property(search, 'findUser');
  });

});
