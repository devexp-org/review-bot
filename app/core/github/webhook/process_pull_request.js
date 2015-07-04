import logger from 'app/core/logger';
import events from 'app/core/events';
import { PullRequest } from 'app/core/models';

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
        .then((pullRequest) => {
            if (!pullRequest) {
                pullRequest = new PullRequest(body.pull_request);
            } else {
                pullRequest.set(body.pull_request);
            }

            return pullRequest.save();
        })
        .then((pullRequest) => {
            events.emit('github:pull_request:' + body.action, { pullRequest });
            logger.info('Pull request saved:', pullRequest.title, pullRequest._id);

            return pullRequest;
        }, logger.error.bind(logger, 'Process pull request: '));
}
