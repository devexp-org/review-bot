import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('mongoose');

  const connection = mongoose.createConnection(options.host);

  connection.shutdown = () => {
    return new Promise(resolve => {
      logger.info('Shutdown starting');
      connection.close(() => {
        logger.info('Shutdown finished');
        resolve();
      });
    })
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
