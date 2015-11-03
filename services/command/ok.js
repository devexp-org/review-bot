'use strict';

import util from 'util';
import { find, cloneDeep } from 'lodash';

const EVENT_NAME_NEW_REVIEWER = 'review:command:ok:new_reviewer';

/**
 * Add new reviewer with already approved status.
 *
 * @param {Object} payload - github webhook payload.
 * @param {String} login
 *
 * @return {Promise}
 */
export function addNewReviewerAndApprove(payload, login) {
  const { action, pullRequest, team, events } = payload;

  return team
    .findTeamMemberByPullRequest(pullRequest, login)
    .then(([user]) => {
      if (!user) {
        return Promise.reject(new Error(util.format(
          '%s tried to approve review, but there isn`t a user with the same login in team [%s – %s] %s',
          login,
          pullRequest.id,
          pullRequest.title,
          pullRequest.html_url
        )));
      }

      const newReviewer = cloneDeep(user);
      const reviewers = pullRequest.get('review.reviewers');

      reviewers.push(newReviewer);

      return action.save({ reviewers }, pullRequest.id);
    })
    .then(pullRequest => action.approveReview(login, pullRequest.id))
    .then(pullRequest => {
      events.emit(EVENT_NAME_NEW_REVIEWER, { pullRequest });

      return pullRequest;
    });
}

/**
 * Handle '/ok' command.
 *
 * @param {String} command - line with user command.
 * @param {Object} payload - github webhook payload.
 *
 * @return {Promise}
 */
export default function okCommand(command, payload) {
  const { action, logger, pullRequest, comment } = payload;
  const login = comment.user.login;
  const reviewer = find(pullRequest.review.reviewers, { login });

  logger.info(
    '"/ok" [%s – %s] %s',
    pullRequest.id,
    pullRequest.title,
    pullRequest.html_url
  );

  if (reviewer) {
    return action.approveReview(login, pullRequest.id);
  } else {
    return addNewReviewerAndApprove(payload, login);
  }
}
