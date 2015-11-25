'use strict';

import _ from 'lodash';
import CommandDispatcher from '../modules/command';

export const constructRegexp = commandRegexp => new RegExp('(^|\\b|\\W|\\s)(' + commandRegexp + ')(\\s|\\b|\\W|$)', 'i');

export default function (options, imports) {

  const queue = imports.queue;
  const model = imports.model;
  const events = imports.events;
  const logger = imports.logger;
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
      handlers: command.handlers.map(service => {
        return wrapHandler(imports[service]);
      })
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

  return Promise.resolve({ service: dispatcher });

}
