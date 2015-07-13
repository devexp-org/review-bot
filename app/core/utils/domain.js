var domain = require('domain');
var logger = require('app/core/logger');

/**
 * Wrapps anything in domain and handle uncaught errors.
 *
 * @param {String} name - Name for inditfy domain.
 * @param {Function} wrapped - Function which contant should be wrapped in domain.
 * @param {Function} customErrorHandler - Custom error handler.
 */
module.exports = function wrapInDomain(name, wrapped, customErrorHandler) {
    var d = domain.create();

    d.on('error', function (err) {
        logger.error('Error in "' + name + '" — ', err);

        if (customErrorHandler) {
            customErrorHandler(err);
        }
    });

    d.run(wrapped);
};
