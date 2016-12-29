import Slack from './class';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('notification.slack');

  const service = new Slack(logger, options);

  service.shutdown = () => {
    return new Promise(resolve => {
      logger.info('Shutdown start');
      service.close(() => {
        logger.info('Shutdown finish');
        resolve();
      });
    });
  };

  // Ignore promise and don't wait until client goes online.
  service.connect();

  return service;

}
