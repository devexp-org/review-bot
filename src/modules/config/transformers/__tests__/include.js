import proxyquire from 'proxyquire';

describe('modules/config/transformers/include', function () {

  let transformer, basePath, includeTransformer, requireStub;

  beforeEach(function () {
    basePath = '';

    requireStub = sinon.stub();

    includeTransformer = proxyquire('../include', {
      '../': {
        requireIfExists: requireStub
      }
    }).default;

    transformer = includeTransformer(basePath);
  });

  it('should parse #include directive', function () {
    const defaultConfig = { port: 80, loglevel: 'warn', '#include:test': 'include.json' };
    const includeConfig = { port: 8080, params: [true, false] };

    requireStub
      .withArgs('include.json')
      .returns(includeConfig);

    const result = transformer(defaultConfig);

    assert.deepEqual(result, { port: 8080, loglevel: 'warn', params: [true, false] });
  });

  it('should parse #include directive recursive', function () {
    const defaultConfig = { port: 80, loglevel: 'warn', '#include:test': 'include.json' };
    const includeConfig = { port: 8080, params: [true, false], '#include:testing': 'testing.json' };
    const testingConfig = { port: 3000 };

    requireStub
      .withArgs('include.json')
      .returns(includeConfig);

    requireStub
      .withArgs('testing.json')
      .returns(testingConfig);

    const result = transformer(defaultConfig);

    assert.deepEqual(result, { port: 3000, loglevel: 'warn', params: [true, false] });
  });

});
