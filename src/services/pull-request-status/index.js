export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('pull-request-status');
  const teamManager = imports['team-manager'];
  const pullRequestGitHub = imports['pull-request-github'];

  function updateStatus(payload) {
    const pullRequest = payload.pullRequest;

    return teamManager.findTeamByPullRequest(pullRequest)
      .then(team => {
        if (!team) {
          return Promise.reject(new Error(
            `Team is not found for pull request ${pullRequest}`
          ));
        }

        const allowed = team.getOption('setGitHubReviewStatus');
        if (!allowed) return;

        return pullRequestGitHub.setDeploymentStatus(pullRequest);
      })
      .catch(logger.error.bind(logger));
  }

  events.on('review:started', updateStatus);
  events.on('review:complete', updateStatus);
  events.on('github:pull_request:opened', updateStatus);
  events.on('github:pull_request:synchronize', updateStatus);

}
