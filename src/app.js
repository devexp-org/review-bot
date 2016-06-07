/* eslint-disable no-console, no-process-exit */

import path from 'path';
import Architect from 'node-architect';
import parseConfig from './modules/config';

const basePath = path.join(__dirname, '..');
const appConfig = parseConfig(basePath);
const application = new Architect(appConfig, basePath);

// `catch` only needed to catch errors during application startup
application
  .execute()
  .then(resolved => {
    const logger = resolved.logger.getLogger('app');
    logger.info('Application fully started');
  })
  .catch(error => {
    console.error(error.stack ? error.stack : error);
    process.exit(1);
  });

process.once('SIGINT', function shutdown() {
  console.log(''); // echo new line char, after "^C"

  Promise.resolve()
    .then(() => application.shutdown())
    .then(() => {
      const timer = setTimeout(() => process.exit(1), 5000);
      // No need to wait this timer if the program is ready to exit.
      timer.unref();
    })
    .catch(error => {
      console.error(error.stack ? error.stack : error);
      process.exit(1);
    });
});
