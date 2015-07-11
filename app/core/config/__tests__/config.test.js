describe('Module: config', function () {
    var path = require('path');
    var config = require('../');
    var options = { path: path.join(__dirname, 'mocks'), cache: false };

    beforeEach(function () {
        config.init(options);
    });

    it('should load simple config', function () {
        assert.propertyVal(config.load('simple'), 'option', 'value');
    });

    describe('NODE_ENV === development', function () {
        it('should load dev configuration from complex config', function () {
            assert.deepEqual(config.load('dev_and_prod'), { common: 1, option: 'dev' });
        });
    });

    describe('NODE_ENV === production', function () {
        var oldEnv;

        beforeEach(function () {
            oldEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            config.init(options);
        });

        afterEach(function () {
            process.env.NODE_ENV = oldEnv;
        });

        it('should load prod configuration from complex config', function () {
            assert.deepEqual(config.load('dev_and_prod'), { common: 1, option: 'prod' });
        });
    });
});
