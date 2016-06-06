import util from 'util';
import { find, reject } from 'lodash';

export const EVENT_NAME = 'review:command:remove';

export const COMMAND_RE = /\/remove (@\w+)/;

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const pullRequestReview = imports['pull-request-review'];

  // TODO must be team config
  const minReviewersCount = options.min || 1;

  /**
   * Handle '/remove' command.
   *
   * @param {String} command - line with user command
   * @param {Object} payload - github webhook payload.
   * @param {Array}  arglist - parsed arguments for command
   *
   * @return {Promise}
   */
  const removeCommand = function removeCommand(command, payload, arglist) {

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    const oldReviewerLogin = arglist.shift();

    let pullRequestReviewers = pullRequest.get('review.reviewers');

    logger.info('"/remove" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(util.format(
        `Cannot ping for closed pull request ${pullRequest}`
      )));
    }

    // TODO config this
    if (!find(pullRequestReviewers, { login: oldReviewerLogin })) {
      return Promise.reject(new Error(util.format(
        '%s tried to remove %s, but he is not a reviewer %s',
        commentUser, oldReviewerLogin, pullRequest
      )));
    }

    if (pullRequestReviewers.length - 1 < minReviewersCount) {
      return Promise.reject(new Error(util.format(
        '%s tried to remove %s, but there is should be at least %s reviewers %s',
        commentUser,
        oldReviewerLogin,
        minReviewersCount,
        pullRequest
      )));
    }

    pullRequestReviewers = reject(
      pullRequestReviewers, { login: oldReviewerLogin }
    );

    return pullRequestReview
      .updateReviewers(pullRequest, pullRequestReviewers)
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });

        return pullRequest;
      });

  };

  return removeCommand;
}
