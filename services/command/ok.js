'use strict';

import util from 'util';
import { find } from 'lodash';

/**
 * Handle '/ok' command.
 *
 * @param {String} command - line with user command.
 * @param {Object} payload - github webhook payload.
 *
 * @return {Promise}
 */
export default function okCommand(command, payload) {

  const action = payload.action;
  const logger = payload.logger;

  logger.info(
    '"/ok" [%s – %s]',
    payload.pullRequest.id,
    payload.pullRequest.title
  );

  const login = payload.comment.user.login;
  const pullRequest = payload.pullRequest;
  const reviewer = find(pullRequest.review.reviewers, { login });

  if (reviewer) {
    return action.approve(login, pullRequest.id);
  } else {
    return Promise.reject(new Error(util.format(
      '%s tried to approve review, but he is not in reviewers list [%s – %s]',
      login,
      pullRequest.id,
      payload.pullRequest.title
    )));
  }

}
