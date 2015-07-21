import _ from 'lodash';
import devExpErr from 'app/modules/utils/error';

import { pullInfoLogger } from 'app/modules/logger';
import saveReview from 'app/modules/review/actions/save';
import team from 'app/modules/team';

const Err = devExpErr('app/modules/review_commands/change');

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
 * Initiator should be an author of pull request.
 *
 * @param {Object} param
 * @param {Array} param.cmd
 * @param {Object} param.pullRequest
 * @param {Object} param.comment
 */
function shouldBeAuthorOfPr({ cmd, pullRequest, comment }) {
    if (pullRequest.user.login !== comment.user.login) {
        throw new Err(
            'CMD',
            `${comment.user.login} try to change reviewer but author is ${pullRequest.user.login}`,
            cmd, pullRequest
        );
    }
}

/**
 * Author of pull request should not set self as reviewer.
 *
 * @param {Object} param
 * @param {Array} param.cmd
 * @param {Object} param.pullRequest
 * @param {String} param.newReviewer
 */
function shouldNotSetSelf({ cmd, pullRequest, newReviewer }) {
    if (newReviewer === pullRequest.user.login) {
        throw new Err(
            'CMD',
            `${newReviewer} can't set himself\\herself as reviewer`,
            cmd, pullRequest
        );
    }
}

/**
 * Check if old reviewer in reviewers list.
 *
 * @param {Object} param
 * @param {Array} param.cmd
 * @param {Object} param.pullRequest
 * @param {Object} param.comment
 * @param {Array} param.reviewers
 * @param {String} param.oldReviewer
 */
function shouldHaveOldReviewerInReviewers({ cmd, pullRequest, comment, reviewers, oldReviewer }) {
    if (!_.find(reviewers, { login: oldReviewer })) {
        throw new Err(
            'CMD',
            `${comment.user.login} tries to change reviewer ${oldReviewer} but he/she is not in reviewers list`,
            cmd, pullRequest
        );
    }
}

export default function startCommandCreator() {

    /**
     * Handles '/change name to name' command.
     *
     * @param {Array} cmd - [command, ...params]
     * @param {Object} payload - github webhook hndler payload.
     *
     * @returns {Promise}
     */
    return function changeCommand(cmd, payload) {
        pullInfoLogger('[/change] ' + cmd, payload.pullRequest);

        const pullRequest = payload.pullRequest;
        const comment = payload.comment;
        const oldReviewer = cmd[0].replace('@', '');

        let newReviewer = (!cmd[2] || cmd[1] !== 'to') ? cmd[1] : cmd[2];
        let reviewers = pullRequest.get('review.reviewers');

        newReviewer = newReviewer.replace('@', '');

        const checkParams = {
            cmd, pullRequest, comment, newReviewer, oldReviewer, reviewers
        };

        return Promise
            .resolve()
            .then(() => {
                _.forEach([
                    shouldPrBeOpened,
                    shouldBeAuthorOfPr,
                    shouldNotSetSelf,
                    shouldHaveOldReviewerInReviewers
                ], check => check(checkParams));
            })
            .then(() => team.get(pullRequest.full_name))
            .then(team => {
                const newReviewerInfo = _.find(team, { login: newReviewer });

                if (!newReviewerInfo) {
                    throw new Err(
                        'CMD',
                        `${comment.user.login} tries to set ${newReviewer} but there's no user with this login in team`,
                        cmd, pullRequest
                    );
                }

                reviewers = _.reject(reviewers, { login: oldReviewer });

                reviewers.push(newReviewerInfo);
                return saveReview({ reviewers }, pullRequest.id);
            });
    };
}
