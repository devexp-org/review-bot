var getPrNumber = require('../utils/get_pr_number');

module.exports = function (github) {
    var PullRequest = github.models.PullRequest;

    return function processIssueComment(body) {
        var pullRequestTitle = body.issue.title,
            pullRequestNumber = getPrNumber(body.issue.pull_request.url),
            repositoryName = body.repository.full_name;

        PullRequest
            .findByNumberAndRepo(pullRequestNumber, repositoryName)
            .then(function (pullRequest) {
                if (!pullRequest) return;

                pullRequest.title = pullRequestTitle;
                return pullRequest.save();
            })
            .then(function (pullRequest) {
                if (!pullRequest) return;

                console.log('updated: ', pullRequest);

                github.emit('issue_comment', { pullRequest: pullRequest, comment: body.comment });
            }, console.error.bind(console));
    };
};
