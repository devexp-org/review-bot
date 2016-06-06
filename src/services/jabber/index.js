import Jabber from './class';

export default function (options, imports) {

  const logger = imports.logger.getLogger('jabber');

  options.info = logger.info.bind(logger);

  const service = new Jabber(options);

  service.shutdown = (callback) => service.close(callback);

  // Ignore promise and don't wait until client goes online.
  service.connect();

  return service;

}
