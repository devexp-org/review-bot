'use strict';

import util from 'util';

const EVENT_NAME = 'review:command:stop';

/**
 * Handle '/stop' command.
 *
 * @param {String} command - line with user command.
 * @param {Object} payload - github webhook payload.
 *
 * @return {Promise}
 */
export default function stopCommand(command, payload) {
  const { action, logger, events, pullRequest, comment } = payload;

  logger.info(
    '"/stop" [%s – %s] %s',
    pullRequest.number,
    pullRequest.title,
    pullRequest.html_url
  );

  if (pullRequest.state !== 'open') {
    return Promise.reject(new Error(util.format(
      'Cannot stop review for closed pull request [%s – %s]',
      pullRequest.number,
      pullRequest.title
    )));
  }

  if (pullRequest.review.status !== 'inprogress') {
    return Promise.reject(new Error(util.format(
      'Cannot stop not in progress review [%s – %s]',
      comment.user.login,
      pullRequest.user.login
    )));
  }

  if (pullRequest.user.login !== comment.user.login) {
    return Promise.reject(new Error(util.format(
      '%s tried to stop a review, but author is %s',
      comment.user.login,
      pullRequest.user.login
    )));
  }

  return action
    .save({ status: 'notstarted' }, pullRequest.id)
    .then(pullRequest => {
      events.emit(EVENT_NAME, { pullRequest });

      return pullRequest;
    });

}
