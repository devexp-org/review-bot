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

            pullRequest.save(function (err, pull) {
                if (err) logger.error('Pull request saved:', pull.title, pull._id);

                events.emit('github:pull_request:' + body.action, { pullRequest: pull });
                logger.info('Pull request saved:', pull.title, pull._id);
            });
        });
}
