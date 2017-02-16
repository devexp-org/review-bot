import path from 'path';
import Architect from 'node-architect';
import { isArray, mergeWith } from 'lodash';

export function merge(object, sources) {
  return mergeWith(object, sources, function (objValue, srcValue) {
    if (isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
}

export function withApp(test, config, done) {
  const application = new Architect(config, path.resolve('.'));

  application
    .execute()
    .then(test)
    .then(application.shutdown.bind(application))
    .then(done, done);
}

export function withInitial(next) {
  return function (test, config, done) {
    config = merge(config, {
      services: {
        queue: {
          path: './src/services/queue'
        },
        events: {
          path: './src/services/events'
        },
        logger: {
          path: './src/services/logger',
          options: { handlers: {} }
        }
      }
    });

    next(test, config, done);
  };
}
