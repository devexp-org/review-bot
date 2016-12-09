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
  function autoStart({ pullRequest }) {
    if (pullRequest.hasReviewers()) return;

    logger.info('Autostart review. %s', pullRequest);

    review.choose(pullRequest)
      .then(result => pullRequestReview.updateReview(pullRequest, result))
      .catch(logger.error.bind(logger));
  }

  events.on('github:pull_request:opened', autoStart);
  events.on('github:pull_request:synchronize', autoStart);

}
