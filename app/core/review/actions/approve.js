// TODO: Refactor
var logger = require('app/core/logger');
var events = require('app/core/events');
var config = require('app/core/config');

var PullRequest = require('app/core/models').PullRequest;

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
            if (!pullRequest) {
                throw new Error('Pull request not found!');
            }

            var reviewers = pullRequest.review.reviewers;

            reviewers.forEach(function (reviewer) {
                if (reviewer.login === login) {
                    reviewer.approved = true;
                }

                if (reviewer.approved) {
                    approvedCount += 1;
                }

                if (approvedCount === reviewConfig.approveCount) {
                    pullRequest.review.status = 'complete';

                    return false;
                }
            });

            pullRequest.review.updated_at = new Date();
            pullRequest.review.reviewers = reviewers;

            return pullRequest.save();
        }).then(function (pullRequest) {
            events.emit('review:approved', { pullRequest: pullRequest, review: pullRequest.review, login: login });
            logger.info('Review approved:', pullRequest.id, login);

            if (pullRequest.review.status === 'complete') {
                events.emit('review:complete', { pullRequest: pullRequest, review: pullRequest.review });
                logger.info('Review complete:', pullId);
            }

            return pullRequest;
        }, logger.error.bind(logger));
};
