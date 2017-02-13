import service from '../';

import githubMock from '../../../github/__mocks__/';

describe('services/team-search/search-github', function () {

  let options, imports, search;

  beforeEach(function () {
    options = {};
    imports = { github: githubMock() };
  });

  it('should be resolved to AbstractUserSearch', function () {
    search = service(options, imports);

    assert.property(search, 'findByLogin');
  });

});
