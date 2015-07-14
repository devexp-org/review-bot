var _ = require('lodash');

var logger = require('app/core/logger');
var saveReview = require('app/core/review/actions/save');

module.exports = function okCommandCreator() {
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
};
