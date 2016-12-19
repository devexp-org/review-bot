import { Router as router } from 'express';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http.model.pull-request');
  const PullRequestModel = imports.model('pull_request');

  const pullRequestReviewRouter = router();

  pullRequestReviewRouter.get('/reviews-by/:username', (req, res) => {
    const login = req.params.username;

    PullRequestModel.findByReviewer(login)
      .then(res.json.bind(res))
      .catch(res.handleError.bind(res, logger));
  });

  return pullRequestReviewRouter;

}
