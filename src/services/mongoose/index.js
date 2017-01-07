import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

mongoose.Promise = global.Promise;

/**
 * Creates "mongoose" service.
 *
 * @param {Object} options
 * @param {String} options.host Mongoose {@link http://mongoosejs.com/docs/connections.html URI}
 * @param {Object} imports
 * @param {Logger} imports.logger
 *
 * @return {Promise.<MongooseConnection>}
 */
export default function setup(options, imports) {

  mongoose.plugin(beautifyUnique);

  const logger = imports.logger.getLogger('mongoose');

  const connection = mongoose.createConnection(options.host);

  connection.shutdown = () => {
    return new Promise(resolve => {
      logger.info('Shutdown starting');
      connection.close(() => {
        logger.info('Shutdown finished');
        resolve();
      });
    });
  };

  return new Promise((resolve, reject) => {
    connection
      .once('open', () => {
        logger.info(
          'Connected to %s:%s (%s)',
          connection.host,
          connection.port,
          options.host
        );
        resolve(connection);
      })
      .once('error', reject);
  });

}

/**
 * @classdesc The class used to represent the mongoose connection.
 *
 * @name MongooseConnection
 * @class
 */

/**
 * Returns or registers with given schema a mongoose model.
 *
 * @name MongooseConnection#model
 * @method
 *
 * @param {String} name Model name
 * @param {Object} [schema] Mongoose schema
 *
 * @return {MongooseModel}
 */
