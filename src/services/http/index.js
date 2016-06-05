import express from 'express';
import { forEach } from 'lodash';
import bodyParser from 'body-parser';
import responseTime from 'response-time';
import enableDestroy from 'server-destroy';
import responseJSON from './response';

export default function setup(options, imports) {

  const app = express();
  const port = options.port || 0; // if the port is `0` then a random port is used
  const logger = imports.logger.getLogger('http');

  app.use(bodyParser.json());
  app.use(responseTime());
  app.use(responseJSON());

  forEach(options.routes, (routeName, route) => {
    const routerModule = imports[routeName];
    if (!routerModule) {
      throw new Error(`Cannot find the route module "${routeName}"`);
    }

    app.use(route, routerModule);
  });

  app.get('/', function (req, res) {
    res.send('Review Service');
  });

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      const address = server.address();

      enableDestroy(server);

      logger.info('Listening at %s:%s', address.address, address.port);

      server.shutdown = (callback) => {
        logger.info('Shutdown start');
        server.destroy(() => {
          logger.info('Shutdown finish');
          callback();
        });
      };

      resolve(server);
    });
  });

}
