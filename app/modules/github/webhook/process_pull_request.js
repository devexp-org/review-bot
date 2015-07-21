import logger from 'app/modules/logger';
import events from 'app/modules/events';
import github from '../api';
import * as models from 'app/modules/models';

const PullRequest = models.get('PullRequest');

/**
 * Handler for github web hook with type pull_request.
 *
 * @param {Object} body - github webhook payload.
 *
 * @returns {Promise}
 */
export default function processPullRequest(body) {
    return PullRequest
        .findById(body.pull_request.id)
        .exec()
        .then(pullRequest => {
            if (!pullRequest) {
                pullRequest = new PullRequest(body.pull_request);
            } else {
                pullRequest.set(body.pull_request);
                github._updatePullRequestBody(pullRequest);
            }

            return pullRequest;
        })
        .then(pullRequest => {
            return github.getPullRequestFiles(pullRequest)
                .then(files => {
                    pullRequest.set('files', files);
                    return pullRequest;
                });
        })
        .then(pullRequest => {
            return pullRequest.save();
        })
        .then(pullRequest => {
            logger.info('Pull request saved:', pullRequest.title, pullRequest._id, pullRequest.html_url);
            events.emit('github:pull_request:' + body.action, { pullRequest: pullRequest });

            return pullRequest;
        });
}
