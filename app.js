/* eslint-disable no-console, no-process-exit */
'use strict';

import Architect from 'node-architect';
import parseConfig from './modules/config';

const basePath = __dirname;
const appConfig = parseConfig(basePath);
const application = new Architect(appConfig, basePath);

// `catch` only needed to catch errors during application startup
application
  .execute()
  .catch(error => {
    console.error(error.stack ? error.stack : error);
    process.exit(1);
  });

process.on('SIGINT', () => {
  application
    .shutdown()
    .catch(error => {
      console.error(error.stack ? error.stack : error);
      process.exit(1);
    });
});
