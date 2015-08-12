'use strict';

import winston, { Logger } from 'winston';

export default function (options, imports) {

  const transports = options.transports.map(transport => {
    if (!('timestamp' in transport)) {
      transport.timestamp = function () { return new Date(); };
    }

    switch (transport.name) {
      case 'file':
        return new winston.transports.File(transport);

      case 'daily-rotate-file':
        return new winston.transports.DailyRotateFile(transport);

      case 'console':
        return new winston.transports.Console(transport);

      default:
        throw new Error('Invalid transport name ' + transport.name);
    }
  });

  const service = new Logger({ transports });

  return Promise.resolve({ service });

}
