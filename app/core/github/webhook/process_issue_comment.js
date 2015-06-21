import logger from 'app/core/logger';
import { PullRequest } from 'app/core/models';
import getPrNumber from 'app/core/github/utils/get_pr_number';
import events from 'app/core/events';

export default function processIssueComment(body) {
    var pullRequestTitle = body.issue.title,
        pullRequestNumber = getPrNumber(body.issue.pull_request.url),
        repositoryName = body.repository.full_name;

    return PullRequest
        .findByNumberAndRepo(pullRequestNumber, repositoryName)
        .then(function (pullRequest) {
            if (!pullRequest) return;

            pullRequest.title = pullRequestTitle;

            return pullRequest.save();
        })
        .then(function (pullRequest) {
            if (!pullRequest) return;

            logger.info('Pull request updated:', pullRequest.title, pullRequest._id);

            events.emit('github:issue_comment', { pullRequest: pullRequest, comment: body.comment });

            return pullRequest;
        }, logger.error.bind(logger));
}
