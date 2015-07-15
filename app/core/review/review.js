var _ = require('lodash');
var logger = require('app/core/logger');
var ranking = require('./ranking');
var PullRequest = require('app/core/models').get('PullRequest');

/**
 * Starts ranking queue.
 *
 * @param {Number} pullRequestId
 * @param {Function} reject
 *
 * @returns {Promise}
 */
function startQueue(pullRequestId) {
    return new Promise(function (resolve, reject) {
        PullRequest
            .findById(pullRequestId)
            .then(function (pullRequest) {
                if (!pullRequest) {
                    reject('Pull Request with id = ' + pullRequestId + ' not found!');

                    return;
                }

                resolve({ pull: pullRequest, team: [] });
            });
    });
}

/**
 * Main review suggestion method.
 * Creates queue of promises from processor and retruns suggested reviewrs.
 *
 * @param {Number} pullRequestId
 *
 * @returns {Promise}
 */
module.exports = function review(pullRequestId) {
    var rankers = ranking.get();
    var reviewQueue = startQueue(pullRequestId);

    _.forEach(rankers, function (ranker) {
        reviewQueue = reviewQueue.then(function (review) {
            logger.info('Choose reviewer step: ', ranker.name);
            return ranker(review);
        });
    });

    reviewQueue
        .then(function (review) {
            logger.info(
                'Choosing reviewers complete for pull request: ' + review.pull.title + ' — ' + review.pull.html_url,
                'Reviewers are: ' + review.team.map(function (r) { return r.login + ' rank: ' + r.rank + ' '; })
            );
        })
        .catch(logger.error.bind(logger, 'Error in choosing reviewer: '));

    return reviewQueue;
};
