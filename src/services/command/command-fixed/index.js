import util from 'util';

export const EVENT_NAME = 'review:command:fixed';
export const COMMAND_RE = '/fixed';

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('command.fixed');
  const pullRequestReview = imports['pull-request-review'];

  /**
   * Handle '/fixed' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const fixedCommand = function fixedCommand(command, payload) {

    const team = payload.team;
    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    logger.info('"/fixed" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot fix review for closed pull request ${pullRequest}`
      ));
    }

    if (pullRequest.get('review.status') !== 'changesneeded') {
      logger.info(`Cannot fix is not 'changesneeded' review ${pullRequest}`);
    }

    const allowed = team.getOption('fixReviewByAnyone');
    if (commentUser !== pullRequest.user.login && !allowed) {
      return Promise.reject(new Error(util.format(
        '%s tried to fix a review, but author is %s %s',
        commentUser, pullRequest.user.login, pullRequest
      )));
    }

    return pullRequestReview.fixedReview(pullRequest)
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });

  };

  return {
    pattern: COMMAND_RE,
    command: fixedCommand
  };

}
