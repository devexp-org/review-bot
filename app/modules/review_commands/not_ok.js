import _ from 'lodash';

import logger from 'app/modules/logger';
import saveReview from 'app/modules/review/actions/save';

export default function okCommandCreator() {

    /**
     * Handles '/!ok' command.
     *
     * @param {Array} cmd - [command, ...params]
     * @param {Object} payload - github webhook handler payload.
     */
    return function okCommand(cmd, payload) {
        logger.info('!ok command ' + payload.pullRequest.id + ' — ' + payload.pullRequest.title);

        var pullRequest = payload.pullRequest;
        var reviewers = pullRequest.review.reviewers;
        var status = pullRequest.review.status;
        var actor = _.find(reviewers, { login: payload.comment.user.login });
        if (actor) {
            actor.approved = false;
            if (status === 'complete') {
                status = 'inprogress';
            }
            saveReview({ reviewers: reviewers, status: status }, payload.pullRequest.id);
        } else {
            logger.error(
                payload.comment.user.login +
                ' try to cancel approve review but not in reviewrs list for ' +
                payload.pullRequest.id + ' — ' + payload.pullRequest.title
            );
        }
    };
}
