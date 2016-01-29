'use strict';

import path from 'path';

import Application from '../../modules/application';
import projectConfig from '../../modules/config';

export function withApp(test, done) {
  const basePath = path.resolve('.');
  const appConfig = projectConfig(basePath, 'testing');
  appConfig.services.logger.options.transports = [];

  const application = new Application(appConfig, basePath);

  application
    .execute()
    .then(test)
    .then(::application.shutdown)
    .then(done)
    .catch(done);
}

export function withPullRequest(test, done) {

  withApp(imports => {
    const model = imports.model;
    const PullRequest = model.get('pull_request');
    const pullRequest = new PullRequest();

    const pullRequestHook = require('../data/pull_request_webhook');
    pullRequestHook.pull_request.repository = pullRequestHook.repository;
    pullRequestHook.pull_request.organization = pullRequestHook.organization;

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
