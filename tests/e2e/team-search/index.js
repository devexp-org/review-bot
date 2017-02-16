import { merge } from '../app';

export function withTeamSearch(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-search': {
          path: './src/services/team-search'
        }
      }
    }, config);

    next(test, config, done);

  };

}
