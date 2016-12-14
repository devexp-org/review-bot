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
  const repositoryName = payload.repository.full_name;
  const pullRequestNumber = payload.issue.number;

  const PullRequestModel = imports['pull-request-model'];

  return PullRequestModel
    .findByRepositoryAndNumber(repositoryName, pullRequestNumber)
    .then(pullRequest => {
      if (!pullRequest) {
        return Promise.reject(new Error(util.format(
          'Pull request %s/%s not found', repositoryName, pullRequestNumber
        )));
      }

      events.emit(
        'github:issue_comment',
        { pullRequest, comment: payload.comment }
      );

      return pullRequest;
    });

}
