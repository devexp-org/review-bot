'use strict';

import util from 'util';
import { find, reject } from 'lodash';

/**
 * Handle '/busy' command.
 *
 * @param {String} command - line with user command
 * @param {Object} payload - github webhook payload.
 *
 * @return {Promise}
 */
export default function busyCommand(command, payload) {

  const action = payload.action;
  const logger = payload.logger;

  logger.info(
    '"/busy" [%s – %s]',
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

  const login = payload.comment.user.login;
  const pullRequest = payload.pullRequest;
  const reviewer = find(pullRequest.review.reviewers, { login });

  if (reviewer) {
    return payload.review(payload.pullRequest.id)
      .then(result => {
        const candidate = result.team[0];
        const reviewers = reject(
          payload.pullRequest.review.reviewers,
          { login: payload.comment.user.login }
        );

        reviewers.push(candidate);

        return action.save({ reviewers: reviewers }, payload.pullRequest.id);
      });
  } else {
    return Promise.reject(new Error(util.format(
      '%s tried to change reviewer, but he is not in reviewers list [%s – %s]',
      login, pullRequest.id, payload.pullRequest.title
    )));
  }

}
