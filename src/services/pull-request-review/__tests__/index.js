import service from '../index';
import serviceMock from '../__mocks__/';

import loggerMock from '../../logger/__mocks__/';
import eventsMock from '../../events/__mocks__/';
import teamDispatcherMock from '../../team-dispatcher/__mocks__/class';

describe('services/pull-request-review', function () {

  let options, imports, logger, events, teamDispatcher;

  beforeEach(function () {
    options = {};

    logger = loggerMock();
    events = eventsMock();
    teamDispatcher = teamDispatcherMock();

    imports = { events, logger, 'team-dispatcher': teamDispatcher };
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
