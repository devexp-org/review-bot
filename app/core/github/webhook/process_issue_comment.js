import logger from 'app/core/logger';
import events from 'app/core/events';
import { PullRequest } from 'app/core/models';

/**
 * Handler for github web hook with type issue_comment.
 *
 * @param {Object} body - github webhook payload.
 *
 * @returns {Promise}
 */
export default function processIssueComment(body) {
    var pullRequestTitle = body.issue.title,
        pullRequestNumber = body.issue.number,
        repositoryName = body.repository.full_name;

    return PullRequest
        .findByNumberAndRepo(pullRequestNumber, repositoryName)
        .then((pullRequest) => {
            if (!pullRequest) return;

            pullRequest.title = pullRequestTitle;

            return pullRequest.save();
        })
        .then((pullRequest) => {
            if (!pullRequest) return;

            logger.info('Pull request updated:', pullRequest.title, pullRequest._id);
            events.emit('github:issue_comment', { pullRequest, comment: body.comment });

            return pullRequest;
        }, logger.error.bind(logger, 'Process issue comment: '));
}
