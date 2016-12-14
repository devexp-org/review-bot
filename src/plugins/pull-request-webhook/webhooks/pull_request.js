/**
 * Handler for github webhook with type `pull_request`.
 *
 * @param {Object} payload - github webhook payload.
 * @param {Object} imports
 *
 * @return {Promise}
 */
export default function webhook(payload, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('http.webhook');

  const PullRequestModel = imports['pull-request-model'];
  const pullRequestGitHub = imports['pull-request-github'];

  let isNewPullRequest = false;

  return PullRequestModel
    .findById(payload.pull_request.id)
    .then(pullRequest => {
      if (!pullRequest) {
        pullRequest = new PullRequestModel();
        isNewPullRequest = true;
      }

      pullRequestGitHub.setPayload(pullRequest, payload);

      return pullRequestGitHub.loadPullRequestFiles(pullRequest);
    })
    .then(pullRequest => pullRequest.save())
    .then(pullRequest => {
      const action = isNewPullRequest ? 'saved' : 'updated';

      logger.info('Pull request %s %s', action, pullRequest);
      events.emit('github:pull_request:' + payload.action, { pullRequest });

      return pullRequest;
    });

}
