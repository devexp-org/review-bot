'use strict';

import util from 'util';
import { find, reject } from 'lodash';

const COMMAND_REGEXP =
  /(?:^|\W)\/?change\s+@?([-0-9a-z]+)\s+(?:to\s+)?@?([-0-9a-z]+)(?:\W|$)/;

/**
 * Handle '/change' command.
 *
 * @param {String} command - line with user command.
 * @param {Object} payload - github webhook payload.
 *
 * @return {Promise}
 */
export default function changeCommand(command, payload) {

  const team = payload.team;
  const action = payload.action;
  const logger = payload.logger;

  logger.info(
    '"/change" [%s – %s]',
    payload.pullRequest.id,
    payload.pullRequest.title
  );

  if (payload.pullRequest.state !== 'open') {
    return Promise.reject(new Error(util.format(
      'Cannot change reviewer for closed pull request [%s – %s]',
      payload.pullRequest.id,
      payload.pullRequest.title
    )));
  }

  const pullRequest = payload.pullRequest;
  const participant = command.match(COMMAND_REGEXP);

  if (!participant) {
    return Promise.reject(new Error(util.format(
      'Panic! Cannot parse user `change` command `%s` [%s – %s]',
      command,
      payload.pullRequest.id,
      payload.pullRequest.title
    )));
  }

  const oldReviewerLogin = participant[1];
  const newReviewerLogin = participant[2];

  let reviewers = pullRequest.get('review.reviewers');

  if (pullRequest.user.login !== payload.comment.user.login) {
    return Promise.reject(new Error(util.format(
      '%s tried to change reviewer, but author is %s',
      payload.comment.user.login,
      pullRequest.user.login
    )));
  }

  if (!find(reviewers, { login: oldReviewerLogin })) {
    return Promise.reject(new Error(util.format(
      '%s tried to change reviewer %s but he is not in reviewers list',
      payload.comment.user.login,
      oldReviewerLogin
    )));
  }

  if (find(reviewers, { login: newReviewerLogin })) {
    return Promise.reject(new Error(util.format(
      '%s tried to change reviewer %s to %s but he is already in reviewers list',
      payload.comment.user.login,
      oldReviewerLogin,
      newReviewerLogin
    )));
  }

  if (newReviewerLogin === pullRequest.user.login) {
    return Promise.reject(new Error(util.format(
      '%s cannot set himself as reviewer',
      newReviewerLogin
    )));
  }

  return team
    .findByPullRequest(pullRequest)
    .then(result => {
      const newReviewer = find(result, { login: newReviewerLogin });

      if (!newReviewer) {
        return Promise.reject(new Error(util.format(
          '%s tried to set %s, but there are no user with the same login in team',
          payload.comment.user.login,
          newReviewerLogin
        )));
      }

      reviewers = reject(reviewers, { login: oldReviewerLogin });
      reviewers.push(newReviewer);

      return action.save({ reviewers }, pullRequest.id);
    });

}
