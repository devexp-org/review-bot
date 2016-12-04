import service from '../';
import serviceMock from '../__mocks__/';

import loggerMock from '../../logger/__mocks__/';
import teamManagerMock from '../../team-manager/__mocks__/';

describe('services/review', function () {

  it('the mock object should have the same methods', function () {
    const logger = loggerMock();
    const teamManager = teamManagerMock();

    const options = { steps: ['step1', 'step2'] };
    const imports = { logger, 'team-manager': teamManager };

    const obj = service(options, imports);
    const mock = serviceMock();

    const methods = Object.keys(mock);

    methods.forEach(method => assert.property(obj, method));
  });

});
