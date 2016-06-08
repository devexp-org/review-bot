import { isPlainObject } from 'lodash';
import { Router as router } from 'express';

import pullRequestHook from './webhooks/pull_request';
import issueCommentHook from './webhooks/issue_comment';

const GITHUB_HEADER_EVENT = 'x-github-event';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('http.webhook');

  const githubRouter = router();

  githubRouter.get('/webhook', function (req, res) {
    res.send('ok').end();
  });

  githubRouter.post('/webhook', function (req, res) {
    const reject = (e) => {
      res.error(e.message);
      logger.error(e);
    };
    const resolve = () => res.ok({ status: 'ok' });

    const eventName = req.headers[GITHUB_HEADER_EVENT];

    if (!isPlainObject(req.body)) {
      reject(new Error('req.body is not a plain object'));
      return;
    }

    logger.info('New event, event=%s, action=%s', eventName, req.body.action);

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
        const errorMessage = `Unknown event "${eventName}"`;
        logger.error(new Error(errorMessage));
        res.error(errorMessage, 200);
      }
    }

  });

  return githubRouter;

}
