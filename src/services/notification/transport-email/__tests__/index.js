import service from '../';
import serviceMock from '../__mocks__/';

import loggerMock from '../../../logger/__mocks__/';

describe('services/notification/transport-email', function () {

  let options, imports, logger;

  beforeEach(function () {
    logger = loggerMock();

    options = {};
    imports = { logger };
  });

  it('the mock object should have the same methods', function () {
    const obj = service(options, imports);
    const mock = serviceMock();
    const methods = Object.keys(mock);

    methods.forEach(method => assert.property(obj, method));
  });

});
