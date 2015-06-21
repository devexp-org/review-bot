import logger from 'app/core/logger';
import { PullRequest } from 'app/core/models';
import events from 'app/core/events';

export default function processPullRequest(body) {
    return PullRequest
        .findById(body.pull_request.id)
        .exec()
        .then(function (pullRequest) {
            if (!pullRequest) {
                pullRequest = new PullRequest(body.pull_request);
            } else {
                pullRequest.set(body.pull_request);
            }

            return pullRequest.save();
        })
        .then(function (pullRequest) {
            events.emit('github:pull_request', { pullRequest: pullRequest });

            logger.info('Pull request saved:', pullRequest.title, pullRequest._id);

            return pullRequest;
        }, logger.error.bind(logger));
}
