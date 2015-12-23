'use strict';

import util from 'util';

const EVENT_NAME = 'review:command:ping';

export default function commandService(options, imports) {

  const { events, logger } = imports;

  /**
   * Handle '/ping' command.
   *
   * @param {Object} payload - github webhook payload.
   * @param {String} command - line with user command.
   *
   * @return {Promise}
   */
  const pingCommand = function pingCommand(payload, command) {
    const pullRequest = payload.pullRequest;

    logger.info(
      '"/ping" [%s – %s]',
      pullRequest.number,
      pullRequest.title,
      pullRequest.html_url
    );

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(util.format(
        'Cannot ping for closed pull request [%s – %s] %s',
        pullRequest.number,
        pullRequest.title,
        pullRequest.html_url
      )));
    }

    if (pullRequest.user.login !== payload.comment.user.login) {
      return Promise.reject(new Error(util.format(
        '%s tried to ping a review, but author is %s',
        payload.comment.user.login,
        pullRequest.user.login
      )));
    }

    events.emit(EVENT_NAME, { pullRequest });

    return Promise.resolve();
  };

  return pingCommand;
}
