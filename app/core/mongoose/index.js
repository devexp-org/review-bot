var mongoose = require('mongoose');
var logger = require('app/core/logger');

/**
 * Connects to mongodb.
 *
 * @param {Object} options - connection params.
 */
module.exports.init = function init(options) {
    if (mongoose.connection.readyState === 2) {
        logger.info('Mongodb already connected');
        return;
    }

    mongoose.connect(options.host);

    mongoose
        .connection
        .on('error', logger.error.bind(logger, 'Mongodb connection error: '))
        .once('open', logger.info.bind(logger, 'Mongodb connected'));
};
