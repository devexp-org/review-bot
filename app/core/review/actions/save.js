var _ = require('lodash');

var logger = require('app/core/logger');
var events = require('app/core/events');

var PullRequest = require('app/core/models').get('PullRequest');

var Err = require('terror').create('app/core/review/actions/save', {
    PULL_NOT_FOUND: 'Pull request with id = %id% not found.',
    START_ERR: 'Try to start review where reviewers weren\'t selected | id - %id%, title - %title%, url - %url% '
});

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
            if (!pullRequest) throw Err(Err.CODES.PULL_NOT_FOUND, { id: pullId });

            if (_.isEmpty(pullRequest.review.reviewers)) {
                isNew = true;
            }

            if (_.isEmpty(review.reviewers)) {
                review.reviewers = pullRequest.get('review.reviewers');
            }

            review = _.assign({}, pullRequest.get('review'), review);

            if (!review.status) {
                review.status = 'notstarted';
            }

            if (review.status === 'inprogress' && _.isEmpty(review.reviewers)) {
                throw Err(Err.CODES.START_ERR, {
                    id: pullRequest.id,
                    title: pullRequest.title,
                    url: pullRequest.html_url
                });
            }

            if (review.status === 'inprogress' && isNew) {
                review.started_at = new Date();
            }

            pullRequest.set('review', review);

            return pullRequest.save();
        }).then(function (pullRequest) {
            var eventName = 'review:updated';

            if (review.status === 'inprogress' && isNew) {
                eventName = 'review:started';
            }

            events.emit(eventName, { pullRequest: pullRequest, review: review });
            logger.info('Review saved:', pullId, eventName);

            return pullRequest;
        });
};
