// TODO: REFACTOR
// HELL BEGIN
var _ = require('lodash');

var logger = require('app/core/logger');
var events = require('app/core/events');

var PullRequest = require('app/core/models').PullRequest;

/**
 * Saves review.
 *
 * @param {Object} review
 * @param {Number} pullId
 *
 * @returns {Promise}
 */
module.exports = function saveReview(review, pullId) {
    var isNew = false;

    return PullRequest
        .findById(pullId)
        .exec()
        .then(function (pullRequest) {
            if (!pullRequest) {
                throw new Error('Pull request not found!');
            }

            if (_.isEmpty(pullRequest.review.reviewers)) {
                isNew = true;
            }

            if (_.isEmpty(review.reviewers)) {
                review.reviewers = pullRequest.review.reviewers;
            }

            review = _.assign({}, pullRequest.review, review);

            if (review.status === 'started' && isNew) {
                review.started_at = new Date();
            }

            if (!review.status) {
                review.status = 'notstarted';
            }

            if (review.status === 'inprogress' && _.isEmpty(review.reviewers)) {
                throw new Error(
                    'Try to start review where reviewers weren\'t selected ' +
                    pullRequest.id + ' — ' + pullRequest.title
                );
            }

            pullRequest.review = review;

            return pullRequest.save();
        }).then(function (pullRequest) {
            var eventName = 'review:updated';

            if (review.status === 'started' && isNew) {
                eventName = 'review:started';
            }

            events.emit(eventName, { pullRequest: pullRequest, review: review });

            logger.info('Review saved:', pullId, eventName);

            return pullRequest;
        }, logger.error.bind(logger));
};
// HELL END
