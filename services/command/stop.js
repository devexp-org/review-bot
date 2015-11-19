'use strict';

import util from 'util';

const EVENT_NAME = 'review:command:stop';

export default function commandService(options, imports) {

  const { action, logger, events } = imports;

  /**
   * Handle '/stop' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const stopCommand = function stopCommand(command, payload) {
    const pullRequest = payload.pullRequest;

    logger.info(
      '"/stop" [%s – %s] %s',
      pullRequest.number,
      pullRequest.title,
      pullRequest.html_url
    );

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(util.format(
        'Cannot stop review for closed pull request [%s – %s] %s',
        pullRequest.number,
        pullRequest.title,
        pullRequest.html_url
      )));
    }

    if (pullRequest.review.status !== 'inprogress') {
      return Promise.reject(new Error(util.format(
        'Cannot stop not in progress review [%s – %s] %s',
        pullRequest.number,
        pullRequest.title,
        pullRequest.html_url
      )));
    }

    if (pullRequest.user.login !== payload.comment.user.login) {
      return Promise.reject(new Error(util.format(
        '%s tried to stop a review, but author is %s',
        payload.comment.user.login,
        pullRequest.user.login
      )));
    }

    return action
      .save({ status: 'notstarted' }, pullRequest.id)
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });

  };

  return Promise.resolve({ service: stopCommand });
}
