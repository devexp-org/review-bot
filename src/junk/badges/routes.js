import { Router as router } from 'express';

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('badges.routes');
  const PullRequestModel = imports['pull-request-model'];

  const badgesRouter = router();

  badgesRouter.get('/pull/:org/:repo/:number', function (req, res) {

    const org = req.params.org;
    const repo = req.params.repo;
    const number = req.params.number;

    if (!org || !repo || !number) {
      res.error('Url format: pull/{org}/{repo}/{number}');
      return;
    }

    PullRequestModel
      .findByRepositoryAndNumber(`${org}/${repo}`, number)
      .then(pullRequest => {
        if (!pullRequest) {
          res.end('Unknown pull request');
          return;
        }

        events.emit('review:update_badges', { pullRequest });
        res.end('ok');
      })
      .catch(err => {
        logger.error(err);

        res.error(err.message);
      });

  });

  return badgesRouter;

}
