import ReviewBadgeBuilder from './class';

export const POSITION = 100;

export default function setup(options, imports) {

  const queue = imports.queue;
  const events = imports.events;
  const logger = imports.logger.getLogger('badges.review');
  const pullRequestGitHub = imports['pull-request-github'];

  const builder = new ReviewBadgeBuilder(options.url);

  /**
   * Update pull request body with review badges.
   *
   * @param {Object} payload
   */
  function updateBadges(payload) {

    const pullRequest = payload.pullRequest;
    const badgeContent = builder.build(payload.pullRequest.review);

    queue.dispatch('pull-request#' + pullRequest.id, () => {
      pullRequestGitHub.setBodySection(
        pullRequest, 'review:badge', badgeContent, POSITION
      );
      return pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
    })
    .catch(logger.error.bind(logger));

  }

  // Subscribe to events for creating review badges.
  events.on('review:updated', updateBadges);
  events.on('review:started', updateBadges);
  events.on('review:approved', updateBadges);
  events.on('review:complete', updateBadges);
  events.on('review:update_badges', updateBadges);

  return {};

}
