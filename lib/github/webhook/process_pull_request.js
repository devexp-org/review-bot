import logger from 'app/lib/logger';
import { PullRequest } from 'app/lib/github/models';
import ee from 'app/lib/github/events';

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
            ee.emit('github:pull_request', { pullRequest: pullRequest });

            logger.info('Pull request saved:', pullRequest.title, pullRequest._id);

            return pullRequest;
        }, logger.error.bind(logger));
}
