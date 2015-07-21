import _ from 'lodash';

import logger from 'app/modules/logger';
import approveReview from 'app/modules/review/actions/approve';

export default function okCommandCreator() {

    /**
     * Handles '/ok' command.
     *
     * @param {Array} cmd - [command, ...params]
     * @param {Object} payload - github webhook handler payload.
     */
    return function okCommand(cmd, payload) {
        logger.info('ok command ' + payload.pullRequest.id + ' — ' + payload.pullRequest.title);

        if (_.find(payload.pullRequest.review.reviewers, { login: payload.comment.user.login })) {
            approveReview(payload.comment.user.login, payload.pullRequest.id);
        } else {
            logger.error(
                payload.comment.user.login +
                ' try to approve review but not in reviewrs list for ' +
                payload.pullRequest.id + ' — ' + payload.pullRequest.title
            );
        }
    };
}
