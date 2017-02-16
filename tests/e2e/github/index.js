import { merge } from '../app';
import secret from '../../../config/secret';
import defaultConfig from '../../../config/default';

export function withGitHub(next) {

  return function (test, config, done) {

    config = merge(config, {
      services: {
        github: defaultConfig.services.github
      }
    });

    config.services.github = merge(
      config.services.github,
      secret.services.github
    );

    next(test, config, done);
  };

}
