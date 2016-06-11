import { map } from 'lodash';
import ResponsibleBadgeBuilder from './class';

export default function setup(options, imports) {

  const queue = imports.queue;
  const events = imports.events;
  const logger = imports.logger.getLogger('badges.resposible');
  const componentsAPI = imports['components-api'];
  const pullRequestGitHub = imports['pull-request-github'];

  const builder = new ResponsibleBadgeBuilder(options.url);

  /**
   * Update pull request body with responsible badges.
   *
   * @param {Object} payload
   */
  function updateBadges(payload) {
    const pullRequest = payload.pullRequest;

    const files = map(pullRequest.files, 'filename');

    componentsAPI
      .getResponsibles(null, { files }, 86400)
      .then(responsibles => {
        const badgeContent = builder.build(responsibles);

        if (badgeContent) {
          queue.dispatch('pull-request#' + pullRequest.id, () => {
            pullRequestGitHub.setBodySection(
              pullRequest, 'responsible:badge', badgeContent, 50
            );
            return pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
          });
        }
      })
      .catch(logger.error.bind(logger));
  }

  // Subscribe on events for creating responsible badges.
  events.on('review:updated', updateBadges);
  events.on('review:started', updateBadges);
  events.on('review:update_badges', updateBadges);
  events.on('github:pull_request:synchronize', updateBadges);

  return {};

}
