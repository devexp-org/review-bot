import _ from 'lodash';

import devExpErr from 'app/modules/utils/error';
import catchHandler from 'app/modules/utils/catch_handler';
import { pullInfoLogger } from 'app/modules/logger';
import review from 'app/modules/review/review';
import saveReview from 'app/modules/review/actions/save';

const Err = devExpErr('app/modules/review_commands/busy');

/**
 * Checks if pull request is open.
 *
 * @param {Object} param
 * @param {Array} param.cmd
 * @param {Object} param.pullRequest
 */
function shouldPrBeOpened({ cmd, pullRequest }) {
    if (pullRequest.state !== 'open') {
        throw new Err('CMD', 'Pull request is closed', cmd, pullRequest);
    }
}

/**
 * Initiator should be in reviewers list to replace himself with new reviewer.
 *
 * @param {Object} param
 * @param {Array} param.cmd
 * @param {Object} param.pullRequest
 * @param {Object} param.comment
 */
function shouldBeInReviewersList({ cmd, pullRequest, comment }) {
    if (pullRequest.state !== 'open') {
        throw new Err(
            'CMD',
            `${comment.user.login} tries to change reviewer but not in reviewers list`,
            cmd, pullRequest
        );
    }
}

export default function startCommandCreator() {

    /**
     * Handles '/busy' command.
     *
     * @param {Array} cmd - [command, ...params]
     * @param {Object} payload - github webhook handler payload.
     */
    return function busyCommand(cmd, payload) {
        pullInfoLogger('[/busy] ' + cmd, payload.pullRequest);

        const checkParams = { cmd, pullRequest: payload.pullRequest, comment: payload.comment };

        return Promise
            .resolve()
            .then(() => {
                _.forEach([
                    shouldPrBeOpened,
                    shouldBeInReviewersList
                ], check => check(checkParams));
            })
            .then(() => review(payload.pullRequest.id))
            .then(resultReview => {
                const newReviewer = resultReview.team[0];
                const reviewers = _.reject(payload.pullRequest.get('review.reviewers'), {
                    login: payload.comment.user.login
                });

                reviewers.push(newReviewer);

                return saveReview({ reviewers }, payload.pullRequest.id);
            })
            .catch(catchHandler);
    };
}
