/* eslint-disable no-console, no-process-exit */

import path from 'path';
import Architect from 'node-architect';
import parseConfig from './modules/config';

const basePath = path.join(__dirname, '..');
const appConfig = parseConfig(basePath);
const application = new Architect(appConfig, basePath);

application
  .execute()
  .then(resolved => {
    const events = resolved.events;
    const logger = resolved.logger.getLogger('app');

    logger.info('Application started');
    events.emit('app:start');
  })
  .catch(error => {
    console.error(error.stack ? error.stack : error);
    process.exit(1);
  });

process.once('SIGINT', () => {
  console.log(''); // echo newline char, after "^C".

  Promise.resolve()
    .then(() => application.shutdown())
    .then(() => {
      const timer = setTimeout(() => process.exit(1), 5000);
      timer.unref(); // no need to wait the timer if the program is ready to exit.
    })
    .catch(error => {
      console.error(error.stack ? error.stack : error);
      process.exit(1);
    });
});
