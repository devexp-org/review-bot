import _ from 'lodash';
import logger from 'app/core/logger';
import events from 'app/core/events';
import { PullRequest } from 'app/core/models';

export default function saveReview(reviewData) {
    var review = reviewData.review,
        isNew = true;

    delete review.changed;

    review.reviewers = review.reviewers.map((reviewer) => {
        delete reviewer.index;

        return reviewer;
    });

    return PullRequest
        .findById(reviewData.id)
        .exec()
        .then((pullRequest) => {
            if (!pullRequest) {
                throw new Error('Pull request not found!');
            }

            if (_.isEmpty(pullRequest.review.reviewers)) {
                isNew = true;
            }

            review.status = 'inprogress';
            review.started_at = new Date();

            pullRequest.review = review;

            return pullRequest.save();
        }).then((pullRequest) => {
            var eventName = 'review:started';

            if (!isNew) {
                eventName = 'review:saved';
            }

            events.emit(eventName, { review });

            logger.info('Review saved:', reviewData.id, eventName);

            return pullRequest;
        }, logger.error.bind(logger));
}
