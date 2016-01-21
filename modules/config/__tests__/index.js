'use strict';

import proxyquire from 'proxyquire';

describe('modules/config', function () {

  let parseConfig, existsStub, readFileSyncStub;

  beforeEach(function () {
    existsStub = sinon.stub();
    readFileSyncStub = sinon.stub();

    const config = proxyquire('../../config', {
      fs: {
        existsSync: existsStub,
        readFileSync: readFileSyncStub
      }
    });

    parseConfig = config.default;
  });

  it('should read default config', function () {
    const defaultConfig = '{ "port": 80 }';

    existsStub.returns(false);
    existsStub.withArgs('config/default.json').returns(true);

    readFileSyncStub.returns('{}');
    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'testing', port: 80 });
  });

  it('should read env config and extend default config if env config exists', function () {
    const defaultConfig = '{ "port": 80 }';
    const testingConfig = '{ "port": 8080 }';

    existsStub.returns(false);
    existsStub.withArgs('config/default.json').returns(true);
    existsStub.withArgs('config/testing.json').returns(true);

    readFileSyncStub.returns({});
    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/testing.json').returns(testingConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'testing', port: 8080 });
  });

  it('should properly merge configs', function () {
    const defaultConfig = '{ "http": { "port": 80, "debug": false } }';
    const testingConfig = '{ "http": { "debug": true } }';

    existsStub.returns(false);
    existsStub.withArgs('config/default.json').returns(true);
    existsStub.withArgs('config/testing.json').returns(true);

    readFileSyncStub.returns({});
    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/testing.json').returns(testingConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'testing', http: { port: 80, debug: true } });
  });

});
