import _ from 'lodash';
import CommandDispatcher from './dispatcher';
import commandLogFactory from './log';

export function constructRegexp(commandRegexp) {
  return new RegExp('(^|\\b|\\W|\\s)(' + commandRegexp + ')(\\s|\\b|\\W|$)', 'i');
}

export default function command(options, imports) {
  const { queue, model, events, logger } = imports;
  const commandLog = commandLogFactory({ logger });
  const pullRequestModel = model.get('pull_request');

  const wrapHandler = function (handler) {
    return function (commentCommand, payload) {
      const pullId = payload.pullRequest.id;
      return queue.dispatch('pull-request-command#' + pullId, () => {
        return new Promise((resolve, reject) => {
          pullRequestModel
            .findById(pullId)
            .then(pullRequest => {
              payload.pullRequest = pullRequest;
              payload.commandLog = commandLog;
              return handler(commentCommand, payload);
            })
            .then(resolve, reject);
        });
      });
    };
  };

  const commands = options.commands.map(command => {
    return {
      test: constructRegexp(command.test),
      handlers: command.handlers.map(service => wrapHandler(imports[service]))
    };
  });

  const dispatcher = new CommandDispatcher(commands);

  options.events.forEach(event => {
    events.on(event, payload => {
      const comment = _.get(payload, 'comment.body', '');

      dispatcher
        .dispatch(comment, payload)
        .catch(::logger.error);
    });
  });

  return dispatcher;
}
