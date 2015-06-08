var getPrNumber = require('../utils/get_pr_number');

module.exports = function (github) {
    return function processIssueComment(body) {
        var pullRequestTitle = body.issue.title,
            pullRequestNumber = getPrNumber(body.issue.pull_request.url),
            commentUser = body.comment.user.login,
            repositoryName = body.repository.full_name;


    };
};
