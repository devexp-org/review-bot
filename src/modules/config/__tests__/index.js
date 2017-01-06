import proxyquire from 'proxyquire';

describe('modules/config', function () {

  let NODE_ENV, parseConfig, existsSyncStub, readFileSyncStub;

  beforeEach(function () {

    existsSyncStub = sinon.stub();
    existsSyncStub.returns(false);

    readFileSyncStub = sinon.stub();
    readFileSyncStub.returns('{}');

    parseConfig = proxyquire('../index', {
      fs: {
        existsSync: existsSyncStub,
        readFileSync: readFileSyncStub
      }
    }).default;

    NODE_ENV = process.env.NODE_ENV;
    process.env.NODE_ENV = 'testing';

  });

  afterEach(function () {
    process.env.NODE_ENV = NODE_ENV;
  });

  it('should read default config', function () {
    const defaultConfig = '{ "port": 80 }';

    existsSyncStub.withArgs('config/default.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'testing', port: 80 });
  });

  it('should read env config and extend default config if env config exists', function () {
    const defaultConfig = '{ "port": 80 }';
    const testingConfig = '{ "port": 8080 }';

    existsSyncStub.withArgs('config/default.json').returns(true);
    existsSyncStub.withArgs('config/testing.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/testing.json').returns(testingConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'testing', port: 8080 });
  });

  it('should merge default and env configs', function () {
    const defaultConfig = '{ "http": { "port": 80, "debug": false } }';
    const testingConfig = '{ "http": { "debug": true } }';

    existsSyncStub.withArgs('config/default.json').returns(true);
    existsSyncStub.withArgs('config/testing.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/testing.json').returns(testingConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'testing', http: { port: 80, debug: true } });
  });

  it('should use `development` config if `process.env.NODE_ENV` does not present', function () {
    const defaultConfig = '{ "http": { "port": 80, "debug": false } }';
    const developmentConfig = '{ "http": { "debug": true } }';

    delete process.env.NODE_ENV;

    existsSyncStub.withArgs('config/default.json').returns(true);
    existsSyncStub.withArgs('config/development.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/development.json').returns(developmentConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'development', http: { port: 80, debug: true } });
  });

  it('should be able apply transformers', function () {
    const defaultConfig = '{ "port": 80 }';

    existsSyncStub.withArgs('config/default.json').returns(true);
    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);

    const result = parseConfig('.', 'development', [
      function (json) { json.port = 8080; return json; }
    ]);

    assert.deepEqual(result, { env: 'development', port: 8080 });
  });

  it('should throw an error if json file is not valid', function () {
    const defaultConfig = '{ "port" 80 }';

    existsSyncStub.withArgs('config/default.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);

    assert.throws(() => { parseConfig('.'); }, /cannot parse/i);
  });

});
