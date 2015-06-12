var path = require('path'),
    isProduction,
    configsDirPath;

/**
 * Initialize config module with path to configs directory.
 *
 * @param {Object} options
 * @param {String} options.path — path to configs directory
 */
module.exports.init = function (options) {
    isProduction = process.env.NODE_ENV === 'production';
    configsDirPath = options.path;
};

/**
 * Loads config by name.
 * If there is property dev or prod in config exist they will be returned for related NODE_ENV.
 *
 * @param  {String} configName
 *
 * @return {Object}
 */
module.exports.load = function (configName) {
    var config = require(path.join(configsDirPath, '/', configName));

    if (isProduction && config.prod) {
        return config.prod;
    } else if (!isProduction && config.dev) {
        return config.dev;
    }

    return config;
};
