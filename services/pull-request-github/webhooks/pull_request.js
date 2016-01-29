'use strict';

/**
 * Handler for github webhook with type `pull_request`.
 *
 * @param {Object} payload - github webhook payload.
 * @param {Object} imports
 *
 * @return {Promise}
 */
export default function webhook(payload, imports) {

  const model = imports.model;
  const logger = imports.logger;
  const events = imports.events;
  const github = imports.github;

  const PullRequestModel = model.get('pull_request');

  logger.info(
    'Webhook triggered: action=%s [%s – %s] %s',
    payload.action,
    payload.pull_request.number,
    payload.pull_request.title,
    payload.pull_request.html_url
  );

  const pullRequestWebhook = payload.pull_request;
  pullRequestWebhook.repository = payload.repository;

  return PullRequestModel
    .findById(pullRequestWebhook.id)
    .then(pullRequest => {
      if (!pullRequest) {
        pullRequest = new PullRequestModel(pullRequestWebhook);
      } else {
        pullRequest.set(pullRequestWebhook);
      }

      return github
        .loadPullRequestFiles(pullRequest)
        .then(files => {
          pullRequest.set('files', files);

          return pullRequest;
        });
    })
    .then(pullRequest => {
      return new Promise((resolve, reject) => {
        pullRequest.save().then(resolve, reject);
      });
    })
    .then(pullRequest => {
      logger.info(
        'Pull request saved [%s – %s] %s',
        pullRequest.number,
        pullRequest.title,
        pullRequest.html_url
      );

      events.emit('github:pull_request', { pullRequest });

      return pullRequest;
    });
}
