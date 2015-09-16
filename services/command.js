'use strict';

import _ from 'lodash';
import CommandDispatcher from '../modules/command';

export default function (options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const action = imports['pull-request-action'];
  const review = imports['choose-reviewer'];
  const team = imports['choose-team'];
  const baseError = imports['base-command-error'];

  const commands = options.commands.map(command => {
    return {
      test: new RegExp('(^|\\b|\\s?)(' + command.test + ')(?=\\s|$)', 'i'),
      handlers: command.handlers.map(path => {
        return imports.requireDefault(path);
      })
    };
  });

  const dispatcher = new CommandDispatcher(commands);

  options.events.forEach(event => {
    events.on(event, payload => {
      payload.events = events;
      payload.logger = logger;
      payload.action = action;
      payload.review = review;
      payload.team = team;
      payload.baseError = baseError;

      const comment = _.get(payload, 'comment.body', '');

      dispatcher
        .dispatch(comment, payload)
        .catch(::logger.error);
    });
  });

  return Promise.resolve({ service: dispatcher });

}
