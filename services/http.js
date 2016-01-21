'use strict';

import _ from 'lodash';
import express from 'express';
import bodyParser from 'body-parser';
import responseTime from 'response-time';
import responseJSON from './http/response';

export default function (options, imports, provide) {

  const app = express();
  const port = options.port || 8080;
  const logger = imports.logger;

  app.use(responseTime());
  app.use(responseJSON());
  app.use(bodyParser.json());

  _.forEach(options.routes || {}, (router, route) => {
    const routerModule = imports[router];
    app.use(route, routerModule);
  });

  const server = app.listen(port, () => {
    logger.info(
      'Server listening at %s:%s',
      server.address().address,
      server.address().port
    );

    server.shutdown = (complete) => server.close(complete);

    provide(server);
  });

}
