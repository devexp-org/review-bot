import LocalRepo from './class';

/**
 * Service for work around your git repo
 *
 * @param {Object}   options
 * @param {Object}   options.services inforamation about repo ( name: url )
 * @param {Object}   imports
 *
 * @return {Promise}
 */
export default function (options, imports) {
  const events = imports.events;
  const logger = imports.logger.getLogger('git');

  const info = logger.info.bind(logger);

  const service = new LocalRepo(options.host, info);

  /**
   * Update local repo files on PR merge
   *
   * @param {Object} payload
   */
  function onPullRequestClose(payload) {
    const pullRequest = payload.pullRequest;

    if (!pullRequest.merged) {
      return;
    }

    service.update(pullRequest.repository.full_name)
      .catch(logger.error.bind(logger));
  }

  // https://developer.github.com/v3/activity/events/types/#pullrequestevent
  // If the action is "closed" and the merged key is true, the pull request was merged.
  events.on('github:pull_request:close', onPullRequestClose);

  return service;

}
