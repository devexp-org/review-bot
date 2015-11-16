'use strict';

import Jabber from '../modules/jabber';

export default function (options, imports) {

  const logger = imports.logger;
  options.info = function (message) {
    logger.info('Jabber: ' + message);
  };

  const service = new Jabber(options);

  const shutdown = function () {
    return new Promise(resolve => {
      service.close();
      resolve();
    });
  };

  // Ignore promise and don't wait until client goes online.
  service.connect();

  return Promise.resolve({ service, shutdown });
}
