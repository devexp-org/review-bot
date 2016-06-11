import { isEmpty } from 'lodash';

/**
 * Returns true if review is not started.
 *
 * @param {Object} pullRequest
 *
 * @return {Boolean}
 */
function shouldStart(pullRequest) {
  return isEmpty(pullRequest.get('review.reviewers'));
}

export default function setup(options, imports) {

  const events = imports.events;
  const review = imports.review;
  const logger = imports.logger.getLogger('review.autoassign');

  const pullRequestReview = imports['pull-request-review'];

  /**
   * Plugin for auto assign reviewers for pull request.
   *
   * @param {Object} payload
   * @param {Object} payload.pullRequest
   */
  function autoStart(payload) {
    if (!shouldStart(payload.pullRequest)) return;

    const pullRequest = payload.pullRequest;

    logger.info('Autostart review %s', pullRequest);

    review.choose(pullRequest)
      .then(result => pullRequestReview.updateReview(pullRequest, result))
      .catch(logger.error.bind(logger));
  }

  events.on('github:pull_request:opened', autoStart);
  events.on('github:pull_request:synchronize', autoStart);

  return {};

}
