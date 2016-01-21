'use strict';

import path from 'path';

import Architect from 'node-architect';
import projectConfig from '../../modules/config';

export function withApp(test, done) {
  const basePath = path.resolve('.');
  const appConfig = projectConfig(basePath, 'testing');
  appConfig.services.logger.options.transports = [];

  const application = new Architect(appConfig, basePath);

  application
    .execute()
    .then(test)
    .then(application.shutdown.bind(application))
    .then(done)
    .catch(done);
}

export function withPullRequest(test, done) {

  withApp(imports => {
    const model = imports.model;
    const PullRequest = model.get('pull_request');
    const pullRequest = new PullRequest();

    const pullRequestHook = require('../data/pull_request');

    return PullRequest
      .remove({})
      .then(() => {
        pullRequest.set(pullRequestHook.pull_request);

        return pullRequest.save();
      })
      .then(() => {
        imports.pullRequest = pullRequest;
        imports.PullRequest = PullRequest;

        return imports;
      })
      .then(test);
  }, done);

}
