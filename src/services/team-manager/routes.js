import { Router as router } from 'express';
import { NotFoundError } from '../http/error';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http-team-manager');
  const teamManager = imports['team-manager'];
  const PullRequestModel = imports['pull-request-model'];

  const teamManagerRoute = router();

  teamManagerRoute.get('/:org/:repo/:number/members', function (req, res) {
    const org = req.params.org;
    const repo = req.params.repo;
    const number = req.params.number;

    PullRequestModel
      .findByRepositoryAndNumber(`${org}/${repo}`, number)
      .then(pullRequest => {
        if (!pullRequest) {
          return Promise.reject(new NotFoundError(
            `Pull request ${org}/${repo}/${number} is not found`
          ));
        }

        const team = teamManager.findTeamByPullRequest(pullRequest);
        if (!team) {
          return Promise.reject(new NotFoundError(
            `Team for pull request ${org}/${repo}/${number} is not found`
          ));
        }

        return team.getMembersForReview(pullRequest);
      })
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return teamManagerRoute;

}
