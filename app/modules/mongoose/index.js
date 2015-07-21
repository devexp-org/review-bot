import mongoose from 'mongoose';
import logger from 'app/modules/logger';

/**
 * Connects to mongodb.
 *
 * @param {Object} options - connection params.
 */
export default {
    init(options) {
        if (mongoose.connection.readyState === 2) {
            logger.info('Mongodb already connected');
            return;
        }

        mongoose.connect(options.host);

        mongoose
            .connection
            .on('error', logger.error.bind(logger, 'Mongodb connection error: '))
            .once('open', logger.info.bind(logger, 'Mongodb connected'));
    }
};
