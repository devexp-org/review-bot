var _ = require('lodash');
var logger = require('app/core/logger');
var PullRequest = require('app/core/models').PullRequest;

/**
 * Creates review load processor.
 *
 * @param {Number} max - max rank which will be substract for amount of active reviews.
 *
 * @returns {Function}
 */
module.exports = function reviewLoadCreator(max) {
    /**
     * Substract rank if member has some active reviews.
     *
     * @param {Object} review
     *
     * @returns {Promise}
     */
    return function reviewLoad(review) {
        return new Promise(function (resolve) {
            var promiseList = [];

            if (_.isEmpty(review.team)) {
                resolve(review);
                return;
            }

            review.team.forEach(function (member) {
                promiseList.push(PullRequest.findOpenReviewsByUser(member.login));
            });

            Promise
                .all(promiseList)
                .then(function (openedReviews) {
                    _(openedReviews)
                        .uniq(function (item) { return item.id; })
                        .first()
                        .forEach(function (activeReview) {
                            activeReview.review.reviewers.forEach(function (reviewer) {
                                reviewer = _.find(review.team, { login: reviewer.login });

                                reviewer.rank -= max;
                            });
                        });

                    resolve(review);
                }, logger.error.bind(logger));
        });
    };
};
