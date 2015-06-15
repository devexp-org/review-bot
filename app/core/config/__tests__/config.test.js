describe('Module: config', function () {
    var path = require('path'),
        config = require('../'),
        options = { path: path.join(__dirname, 'mocks') };

    beforeEach(function () {
        config.init(options);
    });

    it('should load simple config', function () {
        assert.propertyVal(config.load('simple'), 'option', 'value');
    });

    describe('NODE_ENV === development', function () {
        it('should load dev configuration from complex config', function () {
            assert.propertyVal(config.load('dev_and_prod'), 'option', 'dev');
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
            assert.propertyVal(config.load('dev_and_prod'), 'option', 'prod');
        });
    });
});
