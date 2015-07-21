import _ from 'lodash';

import logger, { pullInfoLogger, pullErrorLogger } from 'app/modules/logger';
import review from 'app/modules/review/review';
import saveReview from 'app/modules/review/actions/save';

export default function startCommandCreator() {

    /**
     * Handles '/busy' command.
     *
     * @param {Array} cmd - [command, ...params]
     * @param {Object} payload - github webhook handler payload.
     */
    return function busyCommand(cmd, payload) {
        pullInfoLogger('[/busy]', payload.pullRequest);

        if (payload.pullRequest.state !== 'open') {
            pullErrorLogger(`Can't change reviewer for closed pull request`, payload.pullRequest);
            return;
        }

        if (_.find(payload.pullRequest.review.reviewers, { login: payload.comment.user.login })) {
            review(payload.pullRequest.id)
                .then(
                    resultReview => {
                        const newReviewer = resultReview.team[0];
                        const reviewers = _.reject(payload.pullRequest.get('review.reviewers'), {
                            login: payload.comment.user.login
                        });

                        reviewers.push(newReviewer);

                        saveReview({ reviewers }, payload.pullRequest.id);
                    },
                    logger.error.bind(logger)
                );
        } else {
            pullErrorLogger(
                `${payload.comment.user.login} tries to change reviewer but not in reviewers list`,
                payload.pullRequest
            );
        }
    };
}
