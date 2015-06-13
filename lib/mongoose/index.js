import mongoose from 'mongoose';
import logger from 'app/lib/logger';

export default function connectMongoose(options) {
    mongoose.connect(options.host);

    mongoose
        .connection
        .on('error', logger.error.bind(logger, 'Mongodb connection error: '))
        .once('open', logger.info.bind(logger, 'Mongodb connected'));
}
