import proxyquire from 'proxyquire';

describe('modules/config', function () {

  let parseConfig, existsSyncStub, readFileSyncStub;

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

  });

  it('should read default config', function () {
    const defaultConfig = '{ "port": 80 }';

    existsSyncStub.withArgs('config/default.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'development', port: 80 });
  });

  it('should read env config and extend default config if env config exists', function () {
    const defaultConfig = '{ "port": 80 }';
    const developmentConfig = '{ "port": 8080 }';

    existsSyncStub.withArgs('config/default.json').returns(true);
    existsSyncStub.withArgs('config/development.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/development.json').returns(developmentConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'development', port: 8080 });
  });

  it('should merge default and env configs', function () {
    const defaultConfig = '{ "http": { "port": 80, "debug": false } }';
    const developmentConfig = '{ "http": { "debug": true } }';

    existsSyncStub.withArgs('config/default.json').returns(true);
    existsSyncStub.withArgs('config/development.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/development.json').returns(developmentConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'development', http: { port: 80, debug: true } });
  });

  it('should parse #include directive', function () {
    const defaultConfig = '{ "port": 80, "#include:test": "include.json" }';
    const includeConfig = '{ "port": 8080, "params": [true, false] }';

    existsSyncStub.withArgs('config/default.json').returns(true);
    existsSyncStub.withArgs('config/include.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/include.json').returns(includeConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'development', port: 8080, params: [true, false] });

  });

  describe('#comment', function () {

    it('should parse #comment directive in object key', function () {
      const defaultConfig = '{ "port": 80, "#comment:test": "comment" }';
      existsSyncStub.withArgs('config/default.json').returns(true);
      readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);

      const result = parseConfig('.');

      assert.deepEqual(result, { env: 'development', port: 80 });
    });

    it('should parse #comment directive in array value', function () {
      const defaultConfig = '{ "port": 80, "params": [true, "#comment:test"] }';
      existsSyncStub.withArgs('config/default.json').returns(true);
      readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);

      const result = parseConfig('.');

      assert.deepEqual(result, { env: 'development', port: 80, params: [true] });
    });

  });

  it('should throw an error if json file is not valid', function () {
    const defaultConfig = '{ "port" 80 }';

    existsSyncStub.withArgs('config/default.json').returns(true);

    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);

    assert.throws(() => { parseConfig('.'); }, /cannot parse/i);
  });

});
