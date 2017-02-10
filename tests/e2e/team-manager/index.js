import { merge } from '../app';

export function withTeamManager(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-manager': {
          path: './src/services/team-manager',
          options: {
            drivers: {}
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
