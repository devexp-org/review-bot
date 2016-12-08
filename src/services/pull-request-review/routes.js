import { Router as router } from 'express';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http.model.pull-request');
  const PullRequestModel = imports['pull-request-model'];

  const pullRequestReviewRouter = router();

  pullRequestReviewRouter.get('/:id', (req, res) => {
    PullRequestModel.findById(req.params.id)
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  pullRequestReviewRouter.get('/pulls-by/:username', (req, res) => {
    PullRequestModel.findByUser(req.params.username)
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  pullRequestReviewRouter.get('/reviews-by/:username', (req, res) => {
    PullRequestModel.findByReviewer(req.params.username)
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return pullRequestReviewRouter;

}
