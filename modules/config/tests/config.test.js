describe('Module: config', function () {
    var config = require('../');

    it('should load simple config', function () {
        assert.propertyVal(config.load('tests/mocks/simple'), 'option', 'value');
    });

    describe('NODE_ENV === development', function () {
        it('should load dev configuration from complex config', function () {
            assert.propertyVal(config.load('tests/mocks/dev-and-prod'), 'option', 'dev');
        });
    });

    describe('NODE_ENV === production', function () {
        var oldEnv;

        beforeEach(function () {
            oldEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            delete require.cache[require.resolve('../')];
            config = require('../');
        });

        afterEach(function () {
            process.env.NODE_ENV = oldEnv;
        });

        it('should load prod configuration from complex config', function () {
            assert.propertyVal(config.load('tests/mocks/dev-and-prod'), 'option', 'prod');
        });
    });
});
