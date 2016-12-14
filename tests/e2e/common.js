import path from 'path';

import Architect from 'node-architect';

export function withApp(test, config, done) {
  const application = new Architect(config, path.resolve('.'));

  application
    .execute()
    .then(test)
    .then(application.shutdown.bind(application))
    .then(done)
    .catch(done);
}
