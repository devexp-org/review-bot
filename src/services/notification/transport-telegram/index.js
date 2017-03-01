import Telegram from './class';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('notification.telegram');
  const UserModel = imports.model('user');

  const service = new Telegram(logger, UserModel, options);

  service.shutdown = () => {
    return new Promise(resolve => {
      logger.info('Shutdown start');
      service.close().then(() => {
        logger.info('Shutdown finish');
        resolve();
      });
    });
  };

  // Ignore promise and don't wait until client goes online.
  !options.offline && service.connect();

  return service;

}
