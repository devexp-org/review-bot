'use strict';

import util from 'util';
import { find } from 'lodash';

const EVENT_NAME = 'review:command:not_ok';

export default function commandService(options, imports) {

  const { action, logger, events } = imports;

  /**
   * Handle '/!ok' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const notOkCommand = function notOkCommand(command, payload) {

    const login = payload.comment.user.login;
    const pullRequest = payload.pullRequest;
    const reviewers = pullRequest.get('review.reviewers');
    const commenter = find(reviewers, { login });

    logger.info(
      '"/!ok" [%s – %s] %s',
      pullRequest.number,
      pullRequest.title,
      pullRequest.html_url
    );

    let status = pullRequest.review.status;

    if (commenter) {
      commenter.approved = false;

      if (status === 'complete') {
        status = 'notstarted';
      }

      return action
        .save({ reviewers, status }, pullRequest.id)
        .then(pullRequest => {
          events.emit(EVENT_NAME, { pullRequest });
        });

    } else {
      return Promise.reject(new Error(util.format(
        '%s tried to cancel approve, but he is not in reviewers list [%s – %s] %s',
        login, pullRequest.number, pullRequest.title, pullRequest.html_url
      )));
    }

  };

  return Promise.resolve({ service: notOkCommand });
}
