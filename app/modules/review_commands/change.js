import _ from 'lodash';
import Terror from 'terror';

import logger from 'app/modules/logger';
import saveReview from 'app/modules/review/actions/save';
import team from 'app/modules/team';

const Err = Terror.create('app/modules/review_commands/change', {
    CANT_CHANGE: 'Can`t change reviewer'
});

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
        const pullRequest = payload.pullRequest;
        const comment = payload.comment;
        const message = `${cmd} — ${pullRequest.title} [${pullRequest.html_url}]`;
        const oldReviewer = cmd[0].replace('@', '');

        let newReviewer = (!cmd[2] || cmd[1] !== 'to') ? cmd[1] : cmd[2];
        let reviewers = pullRequest.get('review.reviewers');

        newReviewer = newReviewer.replace('@', '');

        logger.info(`[/change] ${message}`);
        Err.CODES.CANT_CHANGE += ` | ${message}`;

        if (pullRequest.state !== 'open') {
            throw Err.createError(Err.CODES.CANT_CHANGE, 'Pull request is closed');
        }

        if (pullRequest.user.login !== comment.user.login) {
            throw Err.createError(
                Err.CODES.CANT_CHANGE,
                `${comment.user.login} try to change reviewer but author is ${pullRequest.user.login}`
            );
        }

        if (newReviewer === pullRequest.user.login) {
            throw Err.createError(
                Err.CODES.CANT_CHANGE,
                `${newReviewer} can't set himself\\herself as reviewer`
            );
        }

        if (!_.find(reviewers, { login: oldReviewer })) {
            throw Err.createError(
                Err.CODES.CANT_CHANGE,
                `${comment.user.login} tries to change reviewer ${oldReviewer} but he/she is not in reviewers list`
            );
        }

        return team
            .get(pullRequest.full_name)
            .then(team => {
                const newReviewerInfo = _.find(team, { login: newReviewer });

                if (!newReviewerInfo) {
                    throw Err.createError(
                        Err.CODES.CANT_CHANGE,
                        `${comment.user.login} tries to set ${newReviewer} but there's no user with this login in team`
                    );
                }

                reviewers = _.reject(reviewers, { login: oldReviewer });

                reviewers.push(newReviewerInfo);
                return saveReview({ reviewers }, pullRequest.id);
            });
    };
}
