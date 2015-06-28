import _ from 'lodash';
import logger from 'app/core/logger';
import events from 'app/core/events';
import * as config from 'app/core/config';
import { PullRequest } from 'app/core/models';

var reviewConfig = config.load('review');

export default function approveReview(reviewData) {
    var id = reviewData.review.id,
        login = reviewData.user.login,
        approvedCount = 0;

    return PullRequest
        .findById(id)
        .exec()
        .then((pullRequest) => {
            if (!pullRequest) {
                throw new Error('Pull request not found!');
            }

            var reviewers = _.clone(pullRequest.review.reviewers, true);

            reviewers.forEach((reviewer) => {
                if (reviewer.login === login) {
                    reviewer.approved = true;
                }

                if (reviewer.approved) {
                    approvedCount += 1;
                }

                if (approvedCount === reviewConfig.approvedCount) {
                    pullRequest.review.status = 'complete';

                    return false;
                }
            });

            pullRequest.review.updated_at = new Date();
            pullRequest.review.reviewers = reviewers;

            return pullRequest.save();
        }).then((pullRequest) => {
            events.emit('review:approved', { pullRequest, review: reviewData.review, user: reviewData.user });
            logger.info('Review approved:', reviewData.review.id, reviewData.user.username);

            console.log(pullRequest.review);

            if (pullRequest.review.status === 'complete') {
                events.emit('review:complete', { pullRequest, review: reviewData.review });
                logger.info('Review complete:', reviewData.review.id);
            }

            return pullRequest;
        }, logger.error.bind(logger));
}
