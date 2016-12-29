import { Router as router } from 'express';

import { NotFoundError } from '../../modules/errors/';

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('http.badges');
  const PullRequestModel = imports.model('pull_request');

  const badgesRouter = router();

  badgesRouter.get('/:org/:repo/:number/update-badges', function (req, res) {

    const org = req.params.org;
    const repo = req.params.repo;
    const number = req.params.number;

    const fullName = `${org}/${repo}`;

    PullRequestModel
      .findByRepositoryAndNumber(fullName, number)
      .then(pullRequest => {
        if (!pullRequest) {
          return Promise.reject(
            new NotFoundError(`Pull request ${fullName}#${number} is not found`)
          );
        }

        events.emit('review:update_badges', { pullRequest });

        return 'ok';
      })
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return badgesRouter;

}
