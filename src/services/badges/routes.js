import { Router as router } from 'express';

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('http.badges');
  const PullRequestModel = imports['pull-request-model'];

  const badgesRouter = router();

  badgesRouter.get('/pull/:org/:repo/:number', function (req, res) {

    const org = req.params.org;
    const repo = req.params.repo;
    const number = req.params.number;

    PullRequestModel
      .findByRepositoryAndNumber(`${org}/${repo}`, number)
      .then(pullRequest => {
        if (!pullRequest) {
          res.error('Pull request not found');
          return;
        }

        events.emit('review:update_badges', { pullRequest });

        res.end('ok');
      })
      .catch(err => {
        res.error(err.message);
        logger.error(err);
      });

  });

  return badgesRouter;

}
