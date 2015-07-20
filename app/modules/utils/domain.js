import domain from 'domain';
import logger from 'app/modules/logger';

/**
 * Wrapps anything in domain and handle uncaught errors.
 *
 * @param {String} name - Name for inditfy domain.
 * @param {Function} wrapped - Function which contant should be wrapped in domain.
 * @param {Function} customErrorHandler - Custom error handler.
 */
export default function (name, wrapped, customErrorHandler) {
    var d = domain.create();

    d.on('error', function (err) {
        logger.error('Error in %s — %s', name, err);

        if (customErrorHandler) {
            customErrorHandler(err);
        }
    });

    d.run(wrapped);
}
