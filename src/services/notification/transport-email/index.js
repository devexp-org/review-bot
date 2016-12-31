import Email from './class';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('notification.email');

  return new Email(logger, options);

}
