import express from 'express';
import bodyParser from 'body-parser';
import responseTime from 'response-time';
import enableDestroy from 'server-destroy';
import { forEach } from 'lodash';
import responseJSON from './response';

export default function setup(options, imports) {

  const app = express();
  const port = options.port || 0; // if the port is `0` then a random port is used
  const logger = imports.logger.getLogger('http');

  app.use(bodyParser.json());
  app.use(responseTime());
  app.use(responseJSON());

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

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
