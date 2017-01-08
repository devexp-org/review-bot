import util from 'util';

/**
 * Handler for github webhook with type `issue_comment`.
 *
 * @param {Object} payload - github webhook payload.
 * @param {Object} imports
 *
 * @return {Promise}
 */
export default function webhook(payload, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('http.webhook');
  const PullRequestModel = imports.model('pull_request');

  const repositoryName = payload.repository.full_name;
  const pullRequestNumber = payload.issue.number;

  return PullRequestModel
    .findByRepositoryAndNumber(repositoryName, pullRequestNumber)
    .then(pullRequest => {
      if (!pullRequest) {
        return Promise.reject(new Error(util.format(
          'Pull request %s/%s is not found', repositoryName, pullRequestNumber
        )));
      }

      logger.info('Issue comment %s', pullRequest);

      return events.emitAsync(
        'github:issue_comment',
        { pullRequest, comment: payload.comment }
      );
    });

}
