'use strict';

import _ from 'lodash';
import path from 'path';
import express from 'express';

import bodyParser from 'body-parser';
import responseTime from 'response-time';

import responseJSON from './response';

export default function (options, imports) {

  const app = express();
  const port = options.port || 8080;
  const logger = imports.logger;

  const assetsPath = path.join(__dirname, '..', '..', 'assets');

  app.use(responseTime());
  app.use(bodyParser.json());

  app.use(responseJSON());

  const faviconFile = path.join(assetsPath, 'favicon.ico');
  app.get('/favicon.ico', function (req, res) {
    res.sendFile(faviconFile);
  });

  _.forEach(options.routes || {}, (router, route) => {
    const routerModule = imports[router];

    app.use(route, routerModule);
  });

  app.get('/', function (req, res) {
    res.send('Choose Reviewers Bot');
  });

  return new Promise(provide => {
    const server = app.listen(port, () => {
      logger.info(
        'Server listening at %s:%s',
        server.address().address,
        server.address().port
      );

      server.shutdown = function () {
        return new Promise((resolve, reject) => {
          server.close(() => resolve());
        });
      };

      provide(server);
    });

  });

}
