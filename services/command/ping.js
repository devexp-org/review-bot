import util from 'util';

const EVENT_NAME = 'review:command:ping';

/**
 * Handle '/ping' command.
 *
 * @param {String} command - line with user command.
 * @param {Object} payload - github webhook payload.
 *
 * @return {Promise}
 */
export default function startCommand(command, payload) {
  const { pullRequest, events, logger } = payload;

  logger.info(
    '"/ping" [%s – %s] %s',
    pullRequest.id,
    pullRequest.title,
    pullRequest.html_url
  );

  if (payload.pullRequest.state !== 'open') {
    return Promise.reject(new Error(util.format(
      'Cannot ping for closed pull request [%s – %s] %s',
      payload.pullRequest.id,
      payload.pullRequest.title,
      pullRequest.html_url
    )));
  }

  if (payload.pullRequest.user.login !== payload.comment.user.login) {
    return Promise.reject(new Error(util.format(
      '%s tried to ping a review, but author is %s',
      payload.comment.user.login,
      payload.pullRequest.user.login
    )));
  }

  events.emit(EVENT_NAME, { pullRequest });

  return Promise.resolve();
}
