'use strict';

import _ from 'lodash';
import { Router as router } from 'express';

export default function (imports) {

  const model = imports.model;
  const logger = imports.logger;
  const PullRequestModel = model.get('pull_request');

  const clientRouter = router();

  clientRouter.get('/github/pulls/:username', function (req, res) {
    PullRequestModel
      .find({ 'state': 'open' })
      .sort({ updated_at: -1 })
      .exec()
      .then(result => {
        if (_.isEmpty(result)) {
          res.error('Pull requests not found!');
        } else {
          res.success(result);
        }
      })
      .then(null, logger.error.bind(logger));
  });

  clientRouter.get('/github/pull/:id', function (req, res) {
    PullRequestModel
      .findById(req.params.id)
      .then(result => {
        if (_.isEmpty(result)) {
          res.error('Pull request with id = ' + req.params.id + ' not found!');
        } else {
          res.success(result);
        }
      });
  });

  return clientRouter;

}
