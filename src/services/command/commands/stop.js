import util from 'util';

export const EVENT_NAME = 'review:command:stop';

export const COMMAND_RE = /\/stop/;

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const pullRequestReview = imports['pull-request-review'];

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
    const commentUser = payload.comment.user.login;

    logger.info('"/stop" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot stop review for closed pull request ${pullRequest}`
      ));
    }

    if (pullRequest.get('review.status') !== 'inprogress') {
      return Promise.reject(new Error(
        `Cannot stop not in progress review ${pullRequest}`
      ));
    }

    if (commentUser !== pullRequest.user.login) {
      return Promise.reject(new Error(util.format(
        '%s tried to stop a review, but author is %s %s',
        commentUser, pullRequest.user.login, pullRequest
      )));
    }

    return pullRequestReview.stopReview(pullRequest)
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });

  };

  return stopCommand;
}
