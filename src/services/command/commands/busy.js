import util from 'util';
import { find, reject, cloneDeep } from 'lodash';

export const EVENT_NAME = 'review:command:busy';

export const COMMAND_RE = /\/busy/;

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const review = imports.review;
  const pullRequestReview = imports['pull-request-review'];

  /**
   * Handle '/busy' command.
   *
   * @param {String} command - line with user command
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const busyCommand = function busyCommand(command, payload) {

    let newReviewer;

    const pullRequest = payload.pullRequest;
    const commentUser = payload.comment.user.login;

    let pullRequestReviewers = pullRequest.get('review.reviewers');

    logger.info('"/busy" %s', pullRequest);

    if (pullRequest.state !== 'open') {
      return Promise.reject(new Error(
        `Cannot change reviewer for closed pull request ${pullRequest}`
      ));
    }

    if (!find(pullRequestReviewers, { login: commentUser })) {
      return Promise.reject(new Error(util.format(
        '%s tried to change himself, but he is not a reviewer %s',
        commentUser, pullRequest
      )));
    }

    return review.choose(pullRequest)
      .then(({ ranks }) => {
        // TODO handle an empty team.

        newReviewer = cloneDeep(ranks.shift());

        pullRequestReviewers = reject(
          pullRequestReviewers, { login: commentUser }
        );

        pullRequestReviewers.push(newReviewer);

        return pullRequestReview.updateReview(
          pullRequest, { reviewers: pullRequestReviewers }
        );
      })
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest, newReviewer });

        return pullRequest;
      });
  };

  return busyCommand;
}
