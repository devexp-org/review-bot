import _ from 'lodash';
import Terror from 'terror';

import logger from 'app/modules/logger';
import events from 'app/modules/events';
import * as models from 'app/modules/models';

const PullRequest = models.get('PullRequest');

const Err = Terror.create('app/modules/review/actions/save', {
    PULL_NOT_FOUND: 'Pull request with id = %id% not found.',
    START_ERR: 'Try to start review where reviewers weren\'t selected | id - %id%, title - %title%, url - %url% '
});

/**
 * Saves review.
 *
 * @param {Object} review
 * @param {Number} pullId
 *
 * @returns {Promise}
 */
export default function saveReview(review, pullId) {
    let isNew = false;

    return PullRequest
        .findById(pullId)
        .exec()
        .then(pullRequest => {

            if (!pullRequest) {
                throw Err.createError(Err.CODES.PULL_NOT_FOUND, { id: pullId });
            }

            if (_.isEmpty(pullRequest.review.reviewers)) {
                isNew = true;
            }

            if (_.isEmpty(review.reviewers)) {
                review.reviewers = pullRequest.get('review.reviewers');
            }

            review = _.assign({}, pullRequest.get('review'), review);

            if (!review.status) {
                review.status = 'notstarted';
            }

            if (review.status === 'inprogress' && _.isEmpty(review.reviewers)) {
                throw Err.createError(
                    Err.CODES.START_ERR,
                    {
                        id: pullRequest.id,
                        title: pullRequest.title,
                        url: pullRequest.html_url
                    }
                );
            }

            if (review.status === 'inprogress' && isNew) {
                review.started_at = new Date();
            }

            pullRequest.set('review', review);

            return pullRequest.save();

        }).then(pullRequest => {
            let eventName = 'review:updated';

            if (review.status === 'inprogress' && isNew) {
                eventName = 'review:started';
            }

            events.emit(eventName, { pullRequest: pullRequest, review: review });
            logger.info('Review saved:', pullId, eventName);

            return pullRequest;
        });
}
