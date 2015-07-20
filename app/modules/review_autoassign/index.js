var _ = require('lodash');

var logger = require('app/modules/logger');
var review = require('app/modules/review/review');
var saveReview = require('app/modules/review/actions/save');
var events = require('app/modules/events');

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
        .then(function (resultReview) { saveReview({ reviewers: resultReview.team }, pullRequest.id); })
        .catch(logger.error.bind(logger));
}

/**
 * Creates review autoassign plugin.
 */
module.exports = function reviewAutoAssignCreator() {
    events.on('github:pull_request:opened', reviewAutoStart);
    events.on('github:pull_request:synchronize', reviewAutoStart);
};
