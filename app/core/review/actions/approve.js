var logger = require('app/core/logger');
var events = require('app/core/events');
var config = require('app/core/config');

var PullRequest = require('app/core/models').get('PullRequest');

var Err = require('terror').create('app/core/review/actions/approve', {
    PULL_NOT_FOUND: 'Pull request with id = %id% not found.'
});

/**
 * Approves and complete review if approved reviewers count === review config approveCount.
 *
 * @param {String} login - user which approves pull.
 * @param {String} pullId
 *
 * @returns {Promise}
 */
module.exports = function approveReview(login, pullId) {
    var reviewConfig = config.load('review');
    var approvedCount = 0;

    return PullRequest
        .findById(pullId)
        .exec()
        .then(function (pullRequest) {
            if (!pullRequest) throw Err(Err.CODES.PULL_NOT_FOUND, { id: pullId });

            var review = pullRequest.get('review');

            review.reviewers.forEach(function (reviewer) {
                if (reviewer.login === login) {
                    reviewer.approved = true;
                }

                if (reviewer.approved) {
                    approvedCount += 1;
                }

                if (approvedCount === reviewConfig.approveCount) {
                    review.status = 'complete';

                    return false;
                }
            });

            review.updated_at = new Date();

            if (review.status === 'complete') {
                review.completed_at = new Date();
            }

            pullRequest.set('review', review);

            return pullRequest.save();
        }).then(function (pullRequest) {
            if (pullRequest.review.status === 'complete') {
                events.emit('review:complete', { pullRequest: pullRequest, review: pullRequest.review });
                logger.info('Review complete:', pullId);
            } else {
                events.emit('review:approved', { pullRequest: pullRequest, review: pullRequest.review, login: login });
                logger.info('Review approved:', pullRequest.id, login);
            }

            return pullRequest;
        });
};
