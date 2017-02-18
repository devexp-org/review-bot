import util from 'util';

export const EVENT_NAME = 'review:command:restart';
export const COMMAND_RE = '/restart';

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('command.restart');
  const pullRequestReview = imports['pull-request-review'];

  /**
   * Handle '/restart' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const restartCommand = function restartCommand(command, payload) {

    const team = payload.team;
    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    logger.info('"/restart" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot restart review for closed pull request ${pullRequest}`
      ));
    }

    const allowed = team.getOption('startReviewByAnyone');
    if (commentUser !== pullRequest.user.login && !allowed) {
      return Promise.reject(new Error(util.format(
        '%s tried to restart a review, but author is %s %s',
        commentUser, pullRequest.user.login, pullRequest
      )));
    }

    return pullRequestReview.denyReview(pullRequest)
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });

  };

  return {
    pattern: COMMAND_RE,
    command: restartCommand
  };

}
