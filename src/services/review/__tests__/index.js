import service from '../';
import serviceMock from '../__mocks__/';

import modelMock from '../../model/__mocks__/';
import loggerMock from '../../logger/__mocks__/';

describe('services/review', function () {

  it('the mock object should have the same methods', function () {
    const model = modelMock();
    const logger = loggerMock();

    const options = { steps: ['step1', 'step2'] };
    const imports = { model, logger };

    const obj = service(options, imports);
    const mock = serviceMock();

    const methods = Object.keys(mock);

    methods.forEach(method => {
      assert.property(obj, method);
    });

  });

});
