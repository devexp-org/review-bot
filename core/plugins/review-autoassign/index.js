'use strict';

import _ from 'lodash';

/**
 * Check for autostarting review.
 *
 * @param {Object} pullRequest
 *
 * @return {Boolean}
 */
function shouldStart(pullRequest) {
  return _.isEmpty(pullRequest.get('review.reviewers'));
}

export default function (options, imports) {

  const logger = imports.logger;
  const events = imports.events;
  const action = imports['pull-request-action'];
  const chooseReviewer = imports['choose-reviewer'];

  /**
   * Plugin for auto assign reviewers for pull request.
   *
   * @param {Object} payload
   * @param {Object} payload.pullRequest
   */
  function autoStart(payload) {
    const pullRequest = payload.pullRequest;

    if (!shouldStart(pullRequest)) {
      return;
    }

    logger.info(
      'Autostart review [%s – %s] %s',
      pullRequest.number,
      pullRequest.title,
      pullRequest.html_url
    );

    chooseReviewer
      .review(pullRequest.id)
      .then(resultReview => {
        return action.save({ reviewers: resultReview.team }, pullRequest.id);
      })
      .catch(::logger.error);
  }

  events.on('github:pull_request:opened', autoStart);
  events.on('github:pull_request:synchronize', autoStart);

  return {};
}
