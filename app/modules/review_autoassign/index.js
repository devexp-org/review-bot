import _ from 'lodash';

import logger from 'app/modules/logger';
import events from 'app/modules/events';
import review from 'app/modules/review/review';
import saveReview from 'app/modules/review/actions/save';

/**
 * Few checks for autostarting review.
 *
 * @param {Object} pullRequest
 *
 * @returns {Boolean}
 */
function shouldStartReview(pullRequest) {
    if (!_.isEmpty(pullRequest.review.reviewers)) return false;

    return true;
}

/**
 * Plugin for auto assign reviewers for pull request.
 *
 * @param {Object} payload
 * @param {Object} payload.pullRequest
 */
function reviewAutoStart(payload) {
    var pullRequest = payload.pullRequest;

    if (!shouldStartReview(pullRequest)) return;

    logger.info('Autostart review for pull "' + pullRequest.id + ' — ' + pullRequest.title + '"');

    review(pullRequest.id)
        .then(resultReview => {
            saveReview({ reviewers: resultReview.team }, pullRequest.id);
        })
        .catch(logger.error.bind(logger));
}

/**
 * Creates review autoassign plugin.
 */
export default function reviewAutoAssignCreator() {
    events.on('github:pull_request:opened', reviewAutoStart);
    events.on('github:pull_request:synchronize', reviewAutoStart);
}
