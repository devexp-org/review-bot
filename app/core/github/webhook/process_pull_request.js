var logger = require('app/core/logger');
var events = require('app/core/events');
var PullRequest = require('app/core/models').get('PullRequest');
var github = require('../api');

/**
 * Handler for github web hook with type pull_request.
 *
 * @param {Object} body - github webhook payload.
 *
 * @returns {Promise}
 */
module.exports = function processPullRequest(body) {
    return PullRequest
        .findById(body.pull_request.id)
        .exec()
        .then(function (pullRequest) {
            if (!pullRequest) {
                pullRequest = new PullRequest(body.pull_request);
            } else {
                pullRequest.set(body.pull_request);
                github._updatePullRequestBody(pullRequest);
            }

            return pullRequest;
        })
        .then(function (pullRequest) {
            return github.getPullRequestFiles(pullRequest)
                .then(function (files) {
                    pullRequest.set('files', files);
                    return pullRequest;
                });
        })
        .then(function (pullRequest) {
            return pullRequest.save();
        })
        .then(function (pullRequest) {
            events.emit('github:pull_request:' + body.action, { pullRequest: pullRequest });
            logger.info('Pull request saved:', pullRequest.title, pullRequest._id, pullRequest.html_url);

            return pullRequest;
        });
};
