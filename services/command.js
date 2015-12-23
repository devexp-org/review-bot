'use strict';

import { map, get } from 'lodash';
import CommandDispatcher from '../modules/command';

export function constructRegexp(x) {
  return new RegExp('(^|\\s)(' + x + ')(\\s|$)', 'i');
}

export default function (options, imports) {

  const model = imports.model;
  const queue = imports.queue;
  const events = imports.events;
  const logger = imports.logger;
  const PullRequestModel = model.get('pull_request');

  const wrapHandler = function (handler) {

    return function (payload, commentCommand, commandRexExp) {
      const pullId = payload.pullRequest.id;

      return queue.dispatch('pull-request-command#' + pullId, () => {

        return new Promise((resolve, reject) => {
          PullRequestModel
            .findById(pullId)
            .then(pullRequest => {
              payload.pullRequest = pullRequest;

              return handler(payload, commentCommand, commandRexExp);
            })
            .then(resolve, reject);
        });

      });
    };

  };

  const commands = map(options.commands, command => {
    return {
      test: constructRegexp(command.test),
      handlers: command.handlers.map(service => {
        return wrapHandler(imports[service]);
      })
    };
  });

  const dispatcher = new CommandDispatcher(commands);

  (options.events || []).forEach(event => {

    events.on(event, payload => {
      const comment = get(payload, 'comment.body', '');

      dispatcher
        .dispatch(comment, payload)
        .catch(logger.error.bind(logger));
    });

  });

  return dispatcher;

}
