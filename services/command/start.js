'use strict';

import util from 'util';

const EVENT_NAME = 'review:command:start';

/**
 * Handle '/start' command.
 *
 * @param {String} command - line with user command.
 * @param {Object} payload - github webhook payload.
 *
 * @return {Promise}
 */
export default function startCommand(command, payload) {
  const { action, logger, events } = payload;

  logger.info(
    '"/start" [%s – %s]',
    payload.pullRequest.id,
    payload.pullRequest.title
  );

  if (payload.pullRequest.state !== 'open') {
    return Promise.reject(new Error(util.format(
      'Cannot start review for closed pull request [%s – %s]',
      payload.pullRequest.id,
      payload.pullRequest.title
    )));
  }

  if (payload.pullRequest.user.login !== payload.comment.user.login) {
    return Promise.reject(new Error(util.format(
      '%s tried to start a review, but author is %s',
      payload.comment.user.login,
      payload.pullRequest.user.login
    )));
  }

  return action
    .save({ status: 'inprogress' }, payload.pullRequest.id)
    .then(pullRequest => {
      events.emit(EVENT_NAME, pullRequest);

      return pullRequest;
    });

}
