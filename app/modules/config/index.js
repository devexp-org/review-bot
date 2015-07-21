import _ from 'lodash';
import fs from 'fs';
import path from 'path';

let isProduction;
const configCache = {};

export default {
    options: {},

    /**
     * Initialize config module with path to configs directory.
     *
     * @param {Object} options
     * @param {String} options.path - path to configs directory
     */
    init(options) {
        this.options = options;

        isProduction = process.env.NODE_ENV === 'production';
    },

    /**
     * Loads config by name.
     * If there is property dev or prod in config exist they will be returned for related NODE_ENV.
     *
     * @param {String} configName
     *
     * @return {Object}
     */
    load(configName) {
        if (configCache[configName]) {
            return configCache[configName];
        }

        const cfgPath = path.join(this.options.path, configName);
        const envCfgPath = isProduction
            ? path.join(cfgPath, '/prod.js')
            : path.join(cfgPath, '/dev.js');
        const testCfgPath = this.options.isTest && testCfgPath;

        const config = require(path.join(cfgPath, '/common.js'));

        if (fs.existsSync(envCfgPath)) {
            _.assign(config, require(envCfgPath));
        }

        if (testCfgPath && fs.existsSync(testCfgPath)) {
            _.assign(config, require(testCfgPath));
        }

        if (this.options.isCache) {
            configCache[configName] = config;
        }

        return config;
    }
};
