import Jabber from './class';

export default function (options, imports) {

  const logger = imports.logger.getLogger('jabber');

  const service = new Jabber(logger, options);

  service.shutdown = (callback) => {
    logger.info('Shutdown start');
    service.close(() => {
      logger.info('Shutdown finish');
      callback();
    });
  };

  // Ignore promise and don't wait until client goes online.
  service.connect();

  return service;

}
