'use strict';

import _ from 'lodash';
import { Router as router } from 'express';

import pullRequestHook from './webhooks/pull_request';
import issueCommentHook from './webhooks/issue_comment';

const GITHUB_HEADER_EVENT = 'x-github-event';

export default function (imports) {

  const logger = imports.logger;

  const githubRouter = router();

  githubRouter.get('/i', function (req, res) {
    res.ok('ok');
  });

  githubRouter.post('/webhook', function (req, res) {
    if (!_.isPlainObject(req.body)) {
      res.error('req.body is not plain object');
      return;
    }

    const eventName = req.headers[GITHUB_HEADER_EVENT];

    switch (eventName) {
      case 'pull_request':
        pullRequestHook(req.body, imports)
          .then(null, logger.error.bind(logger));
        break;

      case 'issue_comment':
        issueCommentHook(req.body, imports)
          .then(null, logger.error.bind(logger));
        break;

      case 'commit_comment':
      case 'pull_request_review_comment':
        logger.info('Ignore event `%s` from GitHub', eventName);
        res.ok({ status: 'ignored' });
        break;

      case 'ping':
        res.ok('pong');
        return;

      default:
        logger.info('Unknown event `%s` from GitHub', eventName);
        res.error({ status: 'unknown command' });
    }

    res.ok({ status: 'ok' });

  });

  return githubRouter;

}
