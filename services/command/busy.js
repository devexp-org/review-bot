'use strict';

import util from 'util';
import { find, reject } from 'lodash';

const EVENT_NAME = 'review:command:busy';

/**
 * Handle '/busy' command.
 *
 * @param {String} command - line with user command
 * @param {Object} payload - github webhook payload.
 *
 * @return {Promise}
 */
export default function busyCommand(command, payload) {

  const { action, logger, events, pullRequest } = payload;

  logger.info(
    '"/busy" [%s – %s]',
    pullRequest.id,
    pullRequest.title
  );

  if (pullRequest.state !== 'open') {
    return Promise.reject(new Error(util.format(
      'Cannot change reviewer for closed pull request [%s – %s]',
      pullRequest.id,
      pullRequest.title
    )));
  }

  const login = payload.comment.user.login;
  const reviewer = find(pullRequest.review.reviewers, { login });

  if (reviewer) {
    return payload.review.review(pullRequest.id)
      .then(result => {
        const candidate = result.team[0];
        const reviewers = reject(
          pullRequest.review.reviewers,
          { login: payload.comment.user.login }
        );

        reviewers.push(candidate);

        return action
          .save({ reviewers: reviewers }, pullRequest.id)
          .then(pullRequest => {
            events.emit(EVENT_NAME, { pullRequest });

            return pullRequest;
          });
      });
  } else {
    return Promise.reject(new Error(util.format(
      '%s tried to change reviewer, but he is not in reviewers list [%s – %s]',
      login, pullRequest.id, pullRequest.title
    )));
  }

}
