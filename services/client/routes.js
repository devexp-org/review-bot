'use strict';

import _ from 'lodash';
import { Router as router } from 'express';

export default function (options, imports) {

  const model = imports.model;
  const logger = imports.logger;
  const action = imports['pull-request-action'];
  const chooseReviewer = imports['choose-reviewer'];
  const PullRequestModel = model.get('pull_request');

  const clientRouter = router();

  clientRouter.get('/github/pulls/:username', function (req, res) {
    PullRequestModel
      .find({ state: 'open' })
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

  clientRouter.get('/reviews/:username', (req, res) => {
    PullRequestModel
      .findByReviewer(req.params.username)
      .then(reviews => {
        _.isEmpty(reviews)
          ? res.error('Reviews not found!')
          : res.success(reviews);
      });
  });

  clientRouter.get('/reviewers/choose/:id', (req, res) => {
    chooseReviewer.review(req.params.id)
      .then(
        res.success.bind(res),
        res.error.bind(res)
      );
  });

  clientRouter.post('/save', (req, res) => {
    action.save(req.body.review, req.body.id)
      .then(() => {
        res.success('review saved');
      })
      .catch(res.error.bind(res));
  });

  clientRouter.post('/approve', (req, res) => {
    action.approve(req.body.user.login, req.body.id)
      .then(() => {
        res.success('review approved');
      })
      .catch(res.error.bind(res));
  });

  return Promise.resolve({ service: clientRouter });

}
