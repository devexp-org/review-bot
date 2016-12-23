import Slack from './class';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('notification.slack');

  const service = new Slack(logger, options);

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
