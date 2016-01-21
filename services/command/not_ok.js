'use strict';

import util from 'util';
import { find } from 'lodash';

const EVENT_NAME = 'review:command:not_ok';

export default function commandService(options, imports) {

  const { action, logger, events } = imports;

  /**
   * Handle '/!ok' command.
   *
   * @param {Object} payload - github webhook payload.
   * @param {String} command - line with user command.
   *
   * @return {Promise}
   */
  const notOkCommand = function notOkCommand(payload, command) {

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

    if (!commenter) {
      return Promise.reject(new Error(util.format(
        '%s tried to cancel approve, but he is not in reviewers list [%s – %s] %s',
        login, pullRequest.number, pullRequest.title, pullRequest.html_url
      )));
    }

    if (status === 'complete') {
      status = 'notstarted';
    }

    commenter.approved = false;

    return action
      .saveReview({ reviewers, status }, pullRequest.id)
      .then(pullRequest => {
        events.emit(EVENT_NAME, { pullRequest });
      });
  };

  return notOkCommand;
}
