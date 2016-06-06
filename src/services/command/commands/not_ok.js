import util from 'util';
import { find } from 'lodash';

export const EVENT_NAME = 'review:command:not_ok';

export const COMMAND_RE = /\/!ok/;

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const pullRequestReview = imports['pull-request-review'];

  /**
   * Handle '/!ok' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const notOkCommand = function notOkCommand(command, payload) {

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    const pullRequestReviewers = pullRequest.get('review.reviewers');

    logger.info('"/!ok" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot cancel approve for closed pull request ${pullRequest}`
      ));
    }

    if (!find(pullRequestReviewers, { login: commentUser })) {
      return Promise.reject(new Error(util.format(
        '%s tried to cancel approve, but he is not a reviewer %s',
        commentUser, pullRequest
      )));
    }

    return pullRequestReview
      .changesNeeded(pullRequest, commentUser)
      .then(pullRequest => pullRequestReview.stopReview(pullRequest))
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });
  };

  return notOkCommand;
}
