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

      if (!pullRequest._id) {
        // if it is a old pull request then create a new one.
        return PullRequestModel
          .remove({ id: pullRequest.id })
          .then(() => {
            const newPullRequest = new PullRequestModel();
            newPullRequest.set(pullRequest);
            return newPullRequest;
          });
      }

      return pullRequest;
    })
    .then(pullRequest => {
      pullRequest.set('repository', payload.repository);

      return pullRequest.save();
    })
    .then(pullRequest => {
      return events.emitAsync(
        'github:issue_comment',
        { pullRequest, comment: payload.comment }
      );
    });

}
