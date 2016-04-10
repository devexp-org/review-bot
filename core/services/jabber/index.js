'use strict';

import Jabber from './jabber';

export default function (options, imports) {

  const logger = imports.logger;
  options.info = function (message) {
    logger.info('Jabber: ' + message);
  };

  const service = new Jabber(options);

  service.shutdown = function () {
    service.close();
    return Promise.resolve();
  };

  // Ignore promise and don't wait until client goes online.
  service.connect();

  return service;
}
