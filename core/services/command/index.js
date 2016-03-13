import _ from 'lodash';
import CommandDispatcher from './dispatcher';

export function constructRegexp(commandRegexp) {
  return new RegExp('(^|\\b|\\W|\\s)(' + commandRegexp + ')(\\s|\\b|\\W|$)', 'i');
}

export default function command(options, imports) {
  const { queue, model, events, logger } = imports;
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
