'use strict';

import winston, { Logger } from 'winston';

export default function setup(options, imports) {

  const transports = options.transports.map(transport => {
    if (!('timestamp' in transport)) {
      transport.timestamp = true;
    }

    switch (transport.name) {
      case 'file':
        return new winston.transports.File(transport);

      case 'console':
        return new winston.transports.Console(transport);

      default:
        throw new Error(`Invalid transport name "${transport.name}"`);
    }
  });

  return new Logger({ transports });

}
