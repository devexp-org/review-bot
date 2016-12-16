import { Router as router } from 'express';

import { NotFoundError } from '../../../modules/errors';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http.model.pull-request');
  const PullRequestModel = imports.model('pull_request');

  const pullRequestRoute = router();

  function findById(id) {
    return PullRequestModel
      .findById(id)
      .then(pullRequest => {
        if (!pullRequest) {
          return Promise.reject(
            new NotFoundError(`Pull request #${id} is not found`)
          );
        }

        return pullRequest;
      });
  }

  pullRequestRoute.get('/', function (req, res) {
    PullRequestModel
      .find({})
      .sort('-updated_at')
      .limit(50)
      .exec()
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  pullRequestRoute.get('/:id', function (req, res) {
    const id = req.params.id;

    findById(id)
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return pullRequestRoute;

}
