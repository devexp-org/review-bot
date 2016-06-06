import util from 'util';

export const EVENT_NAME = 'review:command:ping';

export const COMMAND_RE = /\/ping/;

export default function commandService(options, imports) {

  const { events, logger } = imports;

  /**
   * Handle '/ping' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const pingCommand = function pingCommand(command, payload) {

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    logger.info('"/ping" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(util.format(
        `Cannot ping for closed pull request ${pullRequest}`
      )));
    }

    if (commentUser !== pullRequest.user.login) {
      return Promise.reject(new Error(util.format(
        '%s tried to ping to review, but author is %s %s',
        commentUser, pullRequest.user.login, pullRequest
      )));
    }

    events.emit(EVENT_NAME, { pullRequest });

    return Promise.resolve(pullRequest);
  };

  return pingCommand;
}
