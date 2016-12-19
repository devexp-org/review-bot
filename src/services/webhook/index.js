import { isPlainObject } from 'lodash';
import { Router as router } from 'express';

import pullRequestHook from './github/pull_request';
import issueCommentHook from './github/issue_comment';

const GITHUB_HEADER_EVENT = 'x-github-event';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http.webhook');

  const webhookRouter = router();

  webhookRouter.get('/github', function (req, res) {
    res.send('ok').end();
  });

  webhookRouter.post('/github', function (req, res) {
    const reject = (e) => res.handleError(logger, e);
    const resolve = () => res.json({ status: 'ok' });

    const eventName = req.headers[GITHUB_HEADER_EVENT];

    if (!isPlainObject(req.body)) {
      reject(new Error('req.body is not a plain object'));
      return;
    }

    logger.info('event=%s, action=%s', eventName, req.body.action);

    switch (eventName) {
      case 'ping': {
        res.send('pong').end();
        return;
      }

      case 'pull_request': {
        pullRequestHook(req.body, imports)
          .then(resolve, reject);
        break;
      }

      case 'issue_comment': {
        issueCommentHook(req.body, imports)
          .then(resolve, reject);
        break;
      }

      default: {
        reject(new Error(`Unknown event "${eventName}"`));
      }
    }

  });

  return webhookRouter;

}
