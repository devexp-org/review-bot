'use strict';

import proxyquire from 'proxyquire';

describe('modules/config', function () {

  let parseConfig, existsStub, readFileSyncStub;

  beforeEach(function () {
    existsStub = sinon.stub();
    readFileSyncStub = sinon.stub();

    parseConfig = proxyquire('../../config', {
      fs: {
        existsSync: existsStub,
        readFileSync: readFileSyncStub
      }
    });
  });

  it('should read default config', function () {
    const defaultConfig = '{ "port": 80 }';

    existsStub.returns(false);
    existsStub.withArgs('config/default.json').returns(true);

    readFileSyncStub.returns('{}');
    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'development', port: 80 });
  });

  it('should read env config and extend default config if env config exists', function () {
    const defaultConfig = '{ "port": 80 }';
    const developmentConfig = '{ "port": 8080 }';

    existsStub.returns(false);
    existsStub.withArgs('config/default.json').returns(true);
    existsStub.withArgs('config/development.json').returns(true);

    readFileSyncStub.returns({});
    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/development.json').returns(developmentConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'development', port: 8080 });
  });

  it('should properly merge configs', function () {
    const defaultConfig = '{ "http": { "port": 80, "debug": false } }';
    const developmentConfig = '{ "http": { "debug": true } }';

    existsStub.returns(false);
    existsStub.withArgs('config/default.json').returns(true);
    existsStub.withArgs('config/development.json').returns(true);

    readFileSyncStub.returns({});
    readFileSyncStub.withArgs('config/default.json').returns(defaultConfig);
    readFileSyncStub.withArgs('config/development.json').returns(developmentConfig);

    const result = parseConfig('.');

    assert.deepEqual(result, { env: 'development', http: { port: 80, debug: true } });
  });

});
