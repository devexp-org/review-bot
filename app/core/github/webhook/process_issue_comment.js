var logger = require('app/core/logger');
var events = require('app/core/events');
var PullRequest = require('app/core/models').get('PullRequest');
var github = require('../api');

var Err = require('terror').create('app/core/github/webhook/process_issue_comment', {
    NOT_FOUND: 'Pull request not found'
});

/**
 * Handler for github web hook with type issue_comment.
 *
 * @param {Object} body - github webhook payload.
 *
 * @returns {Promise}
 */
module.exports = function processIssueComment(body) {
    var pullRequestTitle = body.issue.title;
    var pullRequestNumber = body.issue.number;
    var repositoryName = body.repository.full_name;

    return PullRequest
        .findByNumberAndRepo(pullRequestNumber, repositoryName)
        .then(function (pullRequest) {
            if (!pullRequest) {
                return Promise.reject(
                    Err.createError(Err.CODES.NOT_FOUND, { title: pullRequestTitle, number: pullRequestNumber })
                );
            }

            github._updatePullRequestBody(pullRequest);

            pullRequest.set('title', pullRequestTitle);

            return pullRequest.save();
        })
        .then(function (pullRequest) {
            logger.info('Pull request updated:', pullRequest.title, pullRequest._id, pullRequest.html_url);
            events.emit('github:issue_comment', { pullRequest: pullRequest, comment: body.comment });

            return pullRequest;
        });
};
