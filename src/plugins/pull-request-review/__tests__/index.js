import service from '../index';
import serviceMock from '../__mocks__/';

import loggerMock from '../../logger/__mocks__/';
import eventsMock from '../../events/__mocks__/';

describe('services/pull-request-review', function () {

  let options, imports, logger, events;

  beforeEach(function () {
    options = {};

    logger = loggerMock();
    events = eventsMock();

    imports = { events, logger };
  });

  it('the mock object should have the same methods', function () {
    const obj = service(options, imports);
    const mock = serviceMock();
    const methods = Object.keys(mock);

    methods.forEach(method => assert.property(obj, method));
  });

});
