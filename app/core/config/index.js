var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var configCache = {};
var isProduction;
var configsDirPath;
var isTest;
var isCache;

module.exports = {
    /**
     * Initialize config module with path to configs directory.
     *
     * @param {Object} options
     * @param {String} options.path - path to configs directory
     */
    init: function (options) {
        isProduction = process.env.NODE_ENV === 'production';
        configsDirPath = options.path;
        isTest = options.test;
        isCache = options.cache;
    },

    /**
     * Loads config by name.
     * If there is property dev or prod in config exist they will be returned for related NODE_ENV.
     *
     * @param {String} configName
     *
     * @return {Object}
     */
    load: function (configName) {
        if (configCache[configName]) {
            return configCache[configName];
        }

        var cfgPath = path.join(configsDirPath, '/', configName);
        var additionalCfgPath = isProduction ? path.join(cfgPath, '/prod.js') : path.join(cfgPath, '/dev.js');
        var testCfgPath = isTest && testCfgPath;
        var config = require(path.join(cfgPath, '/common.js'));

        if (fs.existsSync(additionalCfgPath)) {
            _.assign(config, require(additionalCfgPath));
        }

        if (testCfgPath && fs.existsSync(testCfgPath)) {
            _.assign(config, require(testCfgPath));
        }

        if (isCache) {
            configCache[configName] = config;
        }

        return config;
    }
};
