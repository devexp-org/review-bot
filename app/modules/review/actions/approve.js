import logger from 'app/modules/logger';
import events from 'app/modules/events';
import config from 'config';
import Terror from 'terror';
import * as models from 'app/modules/models';

const PullRequest = models.get('PullRequest');

const Err = Terror.create('app/modules/review/actions/approve', {
    PULL_NOT_FOUND: 'Pull request with id = %id% not found.'
});

/**
 * Approves and complete review if approved reviewers count === review config approveCount.
 *
 * @param {String} login - user which approves pull.
 * @param {String} pullId
 *
 * @returns {Promise}
 */
export default function approveReview(login, pullId) {
    let approvedCount = 0;
    const reviewConfig = config.get('review');

    return PullRequest
        .findById(pullId)
        .exec()
        .then(pullRequest => {

            if (!pullRequest) {
                throw Err.createError(Err.CODES.PULL_NOT_FOUND, { id: pullId });
            }

            const review = pullRequest.get('review');

            review.reviewers.forEach(reviewer => {
                if (reviewer.login === login) {
                    reviewer.approved = true;
                }

                if (reviewer.approved) {
                    approvedCount += 1;
                }

                if (approvedCount === reviewConfig.approveCount) {
                    review.status = 'complete';

                    return false;
                }
            });

            review.updated_at = new Date();

            if (review.status === 'complete') {
                review.completed_at = new Date();
            }

            pullRequest.set('review', review);

            return pullRequest.save();

        }).then(pullRequest => {

            if (pullRequest.review.status === 'complete') {
                events.emit('review:complete', { pullRequest: pullRequest, review: pullRequest.review });
                logger.info('Review complete:', pullId);
            } else {
                events.emit('review:approved', { pullRequest: pullRequest, review: pullRequest.review, login: login });
                logger.info('Review approved:', pullRequest.id, login);
            }

            return pullRequest;

        });
}
