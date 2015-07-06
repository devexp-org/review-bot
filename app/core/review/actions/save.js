// TODO: REFACTOR
// HELL BEGIN
import _ from 'lodash';

import logger from 'app/core/logger';
import events from 'app/core/events';

import { PullRequest } from 'app/core/models';

/**
 * Saves review.
 *
 * @param {Object} review
 * @param {Number} pullId
 *
 * @returns {Promise}
 */
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

            if (_.isEmpty(review.reviewers)) {
                review.reviewers = pullRequest.review.reviewers;
            }

            review = _.assign({}, pullRequest.review, review);

            if (review.status === 'started' && isNew) {
                review.started_at = new Date();
            }

            if (!review.status) {
                review.status = 'notstarted';
            }

            if (review.status === 'inprogress' && _.isEmpty(review.reviewers)) {
                throw new Error(
                    `Try to start review where reviewers weren't selected ${pullRequest.id} — ${pullRequest.title}`
                );
            }

            pullRequest.review = review;

            return pullRequest.save();
        }).then((pullRequest) => {
            var eventName = 'review:updated';

            if (review.status === 'started' && isNew) {
                eventName = 'review:started';
            }

            events.emit(eventName, { pullRequest, review });

            logger.info('Review saved:', pullId, eventName);

            return pullRequest;
        }, ::logger.error);
}
// HELL END
