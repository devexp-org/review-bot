var isProduction = process.env.NODE_ENV === 'production';

module.exports.load = function (moduleName) {
    var config = require('./' + moduleName);

    if (isProduction && config.prod) {
        return config.prod;
    } else if (!isProduction && config.dev) {
        return config.dev;
    }

    return config;
};
