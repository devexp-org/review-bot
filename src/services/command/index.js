import { get, forEach } from 'lodash';
import CommandDispatcher from './class';

export function buildRegExp(commandRE) {
  return new RegExp('(?:^|\\s)(?:' + commandRE + ')(?:\\s|$)', 'i');
}

export default function setup(options, imports) {

  const queue = imports.queue;
  const events = imports.events;
  const logger = imports.logger.getLogger('command');
  const PullRequestModel = imports['pull-request-model'];

  const wrapHandler = function (handler) {

    return function (command, payload, arglist) {

      const pullId = payload.pullRequest.id;

      return queue.dispatch('pull-request#' + pullId, () => {

        return PullRequestModel
          .findById(pullId)
          .then(pullRequest => {
            payload.pullRequest = pullRequest;

            return handler(command, payload, arglist);
          })
          .then(pullRequest => pullRequest.save());

      });

    };

  };

  const commands = options.commands.map(command => {

    return {

      test: buildRegExp(command.test),

      handlers: command.handlers.map(serviceName => {
        const handler = imports[serviceName];

        if (!handler) {
          throw new Error(`Handler "${serviceName}" is not found`);
        }

        return wrapHandler(handler);
      })

    };

  });

  const dispatcher = new CommandDispatcher(commands);

  forEach(options.events, (event) => {
    events.on(event, (payload) => {
      const comment = get(payload, 'comment.body', '');

      dispatcher
        .dispatch(comment, payload)
        .catch(logger.error.bind(logger));
    });
  });

  return dispatcher;

}
