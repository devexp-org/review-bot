import { merge } from '../app';
import defaultConfig from '../../../config/default';

export function withTeamManager(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-manager': {
          path: defaultConfig.services['team-manager'].path,
          options: {
            drivers: []
          },
          dependencies: [
            'model'
          ]
        }
      }
    }, config);

    next(test, config, done);

  };

}
