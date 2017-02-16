import { merge } from '../app';

export function withCommand(next) {

  return function (test, config, done) {

    config = merge(config, {
      services: {
        command: {
          path: './src/services/command',
          options: {
            events: ['github:issue_comment'],
            commands: {}
          },
          dependencies: [
            'model',
            'queue',
            'events',
            'logger',
            'team-manager'
          ]
        }
      }
    });

    next(test, config, done);

  };

}
