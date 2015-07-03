// TODO: move to model
import _ from 'lodash';

import logger from 'app/core/logger';
import events from 'app/core/events';
import { PullRequest } from 'app/core/models';

export default function saveReview(review, pullId) {
    var isNew = false;

    return PullRequest
        .findById(pullId)
        .exec()
        .then((pullRequest) => {
            if (!pullRequest) {
                throw new Error('Pull request not found!');
            }

            if (_.isEmpty(pullRequest.review.reviewers)) {
                isNew = true;
            }

            if (review.status === 'started' && isNew) {
                review.started_at = new Date();
            }

            if (!review.status) {
                review.status = 'notstarted';
            }

            pullRequest.review = review;

            return pullRequest.save();
        }).then((pullRequest) => {
            var eventName = 'review:saved';

            if (review.status === 'started' && isNew) {
                eventName = 'review:started';
            }

            events.emit(eventName, { review });

            logger.info('Review saved:', pullId, eventName);

            return pullRequest;
        }, logger.error.bind(logger));
}
