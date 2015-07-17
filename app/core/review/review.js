var _ = require('lodash');
var logger = require('app/core/logger');
var ranking = require('./ranking');
var PullRequest = require('app/core/models').get('PullRequest');

var Err = require('terror').create('app/core/review/review', {
    PULL_NOT_FOUND: 'Pull Request with id = %id% not found!'
});

/**
 * Starts ranking queue.
 *
 * @param {Number} pullRequestId
 *
 * @returns {Promise}
 */
function startQueue(pullRequestId) {
    return new Promise(function (resolve, reject) {
        PullRequest
            .findById(pullRequestId)
            .then(function (pullRequest) {
                if (!pullRequest) return reject(Err.createError(Err.CODE.PULL_NOT_FOUND, { id: pullRequestId }));

                resolve({ pull: pullRequest, team: [] });
            });
    });
}

/**
 * Main review suggestion method.
 * Creates queue of promises from processor and retruns suggested reviewers.
 *
 * @param {Number} pullRequestId
 *
 * @returns {Promise}
 */
module.exports = function review(pullRequestId) {
    var rankers = ranking.get();
    var reviewQueue = startQueue(pullRequestId);

    console.log(reviewQueue);

    _.forEach(rankers, function (ranker) {
        reviewQueue = reviewQueue.then(function (review) {
            logger.info('Choose reviewer step: ', ranker.name);
            return ranker(review);
        });
    });

    reviewQueue = reviewQueue
        .then(function (review) {
            logger.info(
                'Choosing reviewers complete for pull request: ' + review.pull.title + ' — ' + review.pull.html_url,
                'Reviewers are: ' + (
                    review.team ?
                        review.team.map(function (r) { return r.login + ' rank: ' + r.rank + ' '; }) :
                        'ooops no reviewers were selected...'
                )
            );

            return review;
        });

    return reviewQueue;
};

/**
 * Review.
 *
 * @typedef {Object} Review
 * @property {Array} team - Team members for review.
 * @property {Object} pull - Pull Request.
 */
