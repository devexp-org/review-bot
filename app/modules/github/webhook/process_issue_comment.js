import logger from 'app/modules/logger';
import events from 'app/modules/events';
import github from '../api';
import Terror from 'terror';
import * as models from 'app/modules/models';

const PullRequest = models.get('PullRequest');

const Err = Terror.create('app/modules/github/webhook/process_issue_comment', {
    NOT_FOUND: 'Pull request not found'
});

/**
 * Handler for github web hook with type issue_comment.
 *
 * @param {Object} body - github webhook payload.
 *
 * @returns {Promise}
 */
export default function processIssueComment(body) {
    const repositoryName = body.repository.full_name;
    const pullRequestTitle = body.issue.title;
    const pullRequestNumber = body.issue.number;

    return PullRequest
        .findByNumberAndRepo(pullRequestNumber, repositoryName)
        .then(pullRequest => {
            if (!pullRequest) {
                return Promise.reject(Err.createError(
                    Err.CODES.NOT_FOUND,
                    { title: pullRequestTitle, number: pullRequestNumber }
                ));
            }

            github._updatePullRequestBody(pullRequest);

            pullRequest.set('title', pullRequestTitle);

            return pullRequest.save();
        })
        .then(pullRequest => {
            logger.info('Pull request updated:', pullRequest.title, pullRequest._id, pullRequest.html_url);
            events.emit('github:issue_comment', { pullRequest, comment: body.comment });

            return pullRequest;
        });
}
