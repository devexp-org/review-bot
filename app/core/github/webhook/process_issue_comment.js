var logger = require('app/core/logger');
var events = require('app/core/events');
var PullRequest = require('app/core/models').get('PullRequest');

/**
 * Handler for github web hook with type issue_comment.
 *
 * @param {Object} body - github webhook payload.
 *
 * @returns {Promise}
 */
module.exports = function processIssueComment(body) {
    var pullRequestTitle = body.issue.title,
        pullRequestNumber = body.issue.number,
        repositoryName = body.repository.full_name;

    return PullRequest
        .findByNumberAndRepo(pullRequestNumber, repositoryName)
        .then(function (pullRequest) {
            if (!pullRequest) return;

            pullRequest.set('title', pullRequestTitle);

            return pullRequest.save();
        })
        .then(function (pullRequest) {
            if (!pullRequest) return;

            logger.info('Pull request updated:', pullRequest.title, pullRequest._id);
            events.emit('github:issue_comment', { pullRequest: pullRequest, comment: body.comment });

            return pullRequest;
        }, logger.error.bind(logger, 'Process issue comment: '));
};
