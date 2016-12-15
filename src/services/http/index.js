import { forEach } from 'lodash';

import express from 'express';
import bodyParser from 'body-parser';
import responseTime from 'response-time';
import enableDestroy from 'server-destroy';

export default function setup(options, imports) {

  const app = express();

  // A random port will be selected if the port set to `0`
  const port = process.env[options.port] || options.port || 0;

  const logger = imports.logger.getLogger('http');

  app.use(bodyParser.json());
  app.use(responseTime());

  forEach(options.middlewares, (middlewareName) => {
    const middlewareModule = imports[middlewareName];

    if (!middlewareModule) {
      throw new Error(`Cannot find middleware module "${middlewareName}"`);
    }

    app.use(middlewareModule);
  });

  forEach(options.routes, (routeName, route) => {
    const routerModule = imports[routeName];

    if (!routerModule) {
      throw new Error(`Cannot find route module "${routeName}"`);
    }

    app.use(route, routerModule);
  });

  app.get('/', function (req, res) {
    res.send('Review Service');
  });

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      // Enable destroying a server, and all currently open connections.
      enableDestroy(server);

      const address = server.address();
      logger.info('Listening at %s:%s', address.address, address.port);

      server.shutdown = () => {
        return new Promise(resolve => {
          logger.info('Shutdown starting');
          server.destroy(() => {
            logger.info('Shutdown finished');
            resolve();
          });
        });
      };

      resolve(server);
    });
  });

}
