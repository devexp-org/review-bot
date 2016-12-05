import service from '../';
import serviceMock from '../__mocks__/';

import loggerMock from '../../logger/__mocks__/';
import githubMock from '../../github/__mocks__/';
import teamManagerMock from '../../team-manager/__mocks__/';

describe('services/project-config', function () {

  let logger, github, teamManager;
  let options, imports;

  beforeEach(function () {

    logger = loggerMock();
    github = githubMock();
    teamManager = teamManagerMock();

    options = {};
    imports = { logger, github, 'team-manager': teamManager };

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
