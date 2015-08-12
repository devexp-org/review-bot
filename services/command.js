'use strict';

import _ from 'lodash';
import CommandDispatcher from '../modules/command';

export default function (options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const action = imports['pull-request-action'];
  const review = imports['choose-reviewer'];
  const team = imports['choose-team'];

  const commands = options.commands.map(command => {
    return {
      regexp: new RegExp('(^|\\W)(' + command.regexp + ')(\\W|$)', 'i'),
      handers: command.handlers.map(path => {
        return require(path);
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

      const comment = _.get(payload, 'comment.body', '');

      dispatcher
        .dispatch(comment, payload)
        .catch(logger.error.bind(logger));
    });
  });

  return Promise.resolve({ service: dispatcher });

}
