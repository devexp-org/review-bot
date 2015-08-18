'use strict';

import util from 'util';
import { find } from 'lodash';

/**
 * Handle '/!ok' command.
 *
 * @param {String} command - line with user command.
 * @param {Object} payload - github webhook payload.
 *
 * @return {Promise}
 */
export default function notOkCommand(command, payload) {

  const action = payload.action;
  const logger = payload.logger;

  logger.info(
    '"/!ok" [%s – %s]',
    payload.pullRequest.id,
    payload.pullRequest.title
  );

  const login = payload.comment.user.login;
  const pullRequest = payload.pullRequest;
  const reviewers = pullRequest.get('review.reviewers');
  const actor = find(reviewers, { login });

  let status = pullRequest.review.status;

  if (actor) {
    actor.approved = false;
    if (status === 'complete') {
      status = 'inprogress';
    }
    return action
      .save({ reviewers: reviewers, status: status }, payload.pullRequest.id)
      .then(null, logger.error.bind(logger));
  } else {
    return Promise.reject(new Error(util.format(
      '%s tried to cancel approve, but he is not in reviewers list [%s – %s]',
      login, pullRequest.id, payload.pullRequest.title
    )));
  }

}
