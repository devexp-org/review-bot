var isProduction = process.env.NODE_ENV === 'production';

/**
 * Loads config by name.
 * If there is property dev or prod in config exist they will be returned for related NODE_ENV.
 *
 * @param  {String} configName
 *
 * @return {Object}
 */
module.exports.load = function (configName) {
    var config = require('./' + configName);

    if (isProduction && config.prod) {
        return config.prod;
    } else if (!isProduction && config.dev) {
        return config.dev;
    }

    return config;
};
