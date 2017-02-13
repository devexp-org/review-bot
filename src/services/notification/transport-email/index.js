import Email from './class';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('notification.email');

  const service = new Email(logger, options);

  !options.offline && service.connect();

  return service;

}
