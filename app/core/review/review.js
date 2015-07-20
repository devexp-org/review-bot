var _ = require('lodash');
var logger = require('app/core/logger');
var team = require('app/core/team');
var PullRequest = require('app/core/models').get('PullRequest');
var ranking = require('./ranking');

var Err = require('terror').create('app/core/review/review', {
    PULL_NOT_FOUND: 'Pull Request with id = %id% not found!'
});

/**
 * Get team for pull request repo.
 *
 * @param {Review} review
 *
 * @returns {Promise}
 */
function getTeam(review) {
    return team
        .get(review.pull.full_name)
        .then(function (team) {
            review.team = team;

            return review;
        });
}

/**
 * Adds zero rank for every reviewer.
 *
 * @param {Review} review
 *
 * @returns {Promise}
 */
function addZeroRank(review) {
    _.forEach(review.team, function (member) {
        member.rank = 0;
    });

    return Promise.resolve(review);
}

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
                if (!pullRequest) {
                    return reject(Err.createError(Err.CODES.PULL_NOT_FOUND, {
                        id: pullRequestId
                    }));
                }

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
    var reviewQueue = startQueue(pullRequestId)
        .then(getTeam)
        .then(addZeroRank);

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
