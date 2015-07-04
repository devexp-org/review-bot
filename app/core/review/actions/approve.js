import _ from 'lodash';
import logger from 'app/core/logger';
import events from 'app/core/events';
import * as config from 'app/core/config';
import { PullRequest } from 'app/core/models';

var reviewConfig = config.load('review');

export default function approveReview(login, pullId) {
    var approvedCount = 0;

    return PullRequest
        .findById(pullId)
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
            events.emit('review:approved', { pullRequest, review: pullRequest.review, login: login });
            logger.info('Review approved:', pullRequest.id, login);

            if (pullRequest.review.status === 'complete') {
                events.emit('review:complete', { pullRequest, review: pullRequest.review });
                logger.info('Review complete:', pullId);
            }

            return pullRequest;
        }, logger.error.bind(logger));
}
