'use strict';

import _ from 'lodash';
import path from 'path';
import express from 'express';

import proxy from 'proxy-express';
import bodyParser from 'body-parser';
import responseTime from 'response-time';

import responseJSON from './http/response';

export default function (options, imports) {

  const app = express();
  const port = options.port || 8080;
  const logger = imports.logger;

  const assetsPath = path.join(__dirname, '..', 'assets');
  const publicPath = path.join(__dirname, '..', 'public');

  app.use(responseTime());
  app.use(bodyParser.json());

  app.use(responseJSON());

  const faviconFile = path.join(assetsPath, 'favicon.ico');
  app.get('/favicon.ico', function (req, res) {
    res.sendFile(faviconFile);
  });

  _.forEach(options.routes || {}, (router, route) => {
    let routerModule = require(router);
    if (routerModule.__esModule) {
      routerModule = routerModule.default;
    }

    app.use(route, routerModule(imports));
  });

  if (process.env.WEBPACK) {
    app.use(proxy('localhost:8081', '/public'));
  } else {
    app.use('/public', express.static(publicPath));
  }

  const indexFile = path.join(assetsPath, 'index.html');
  app.get('*', function (req, res) {
    res.sendFile(indexFile);
  });

  return new Promise(provide => {
    const server = app.listen(port, () => {
      logger.info(
        'Server listening at %s:%s',
        server.address().address,
        server.address().port
      );

      const shutdown = function () {
        return new Promise((resolve, reject) => {
          server.close(function (error) {
            error ? reject(error) : resolve();
          });
        });
      };

      provide({ service: server, shutdown });
    });

  });

}
