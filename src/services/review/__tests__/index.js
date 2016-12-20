import service from '../';
import serviceMock from '../__mocks__/';
import reviewStepMock from '../__mocks__/step';

import loggerMock from '../../logger/__mocks__/';
import teamManagerMock from '../../team-manager/__mocks__/';

describe('services/review', function () {

  let options, imports, logger, teamManager;

  beforeEach(function () {
    logger = loggerMock();
    teamManager = teamManagerMock();

    options = {};
    imports = { logger, 'team-manager': teamManager };
  });

  it('the mock object should have the same methods', function () {
    const obj = service(options, imports);
    const mock = serviceMock();

    const methods = Object.keys(mock);

    methods.forEach(method => assert.property(obj, method));
  });

  it('should setup a review service', function () {
    const step1 = reviewStepMock();
    step1.name.returns('name1');

    const step2 = reviewStepMock();
    step2.name.returns('name2');

    options.steps = ['step1', 'step2'];

    imports.step1 = step1;
    imports.step2 = step2;

    const review = service(options, imports);

    assert.deepEqual(review.getSteps(), { name1: step1, name2: step2 });
  });

  it('should throw an error if step module was not given', function () {
    options.steps = ['unknown-step'];

    assert.throws(() => service(options, imports), /cannot find/i);
  });

});
