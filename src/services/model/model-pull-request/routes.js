import { Router as router } from 'express';

import { NotFoundError } from '../../../modules/errors';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http.model.pull-request');
  const PullRequestModel = imports.model('pull_request');

  const pullRequestRouter = router();

  function findById(id) {
    return PullRequestModel
      .findById(id)
      .then(pullRequest => {
        if (!pullRequest) {
          return Promise.reject(
            new NotFoundError(`Pull request ${id} is not found`)
          );
        }

        return pullRequest;
      });
  }

  pullRequestRouter.get('/', function (req, res) {
    const skip = req.query.skip || 0;
    const limit = req.query.limit || 50;

    PullRequestModel
      .find({})
      .sort('-updated_at')
      .skip(skip)
      .limit(limit)
      .exec()
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  pullRequestRouter.get('/:id', function (req, res) {
    const id = req.params.id;

    findById(id)
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  pullRequestRouter.get('/pulls-by/:username', (req, res) => {
    const login = req.params.username;

    PullRequestModel.findByUser(login)
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return pullRequestRouter;

}
