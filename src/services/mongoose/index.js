import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('mongoose');

  const connection = mongoose.createConnection(options.host);

  connection.shutdown = (callback) => {
    logger.info('Shutdown start');
    connection.close(() => {
      logger.info('Shutdown finish');
      callback();
    });
  };

  return new Promise((resolve, reject) => {
    connection
      .once('open', () => {
        logger.info('Connected to %s:%s', connection.host, connection.port);
        resolve(connection);
      })
      .once('error', (error) => {
        reject(error);
      });
  });

}
