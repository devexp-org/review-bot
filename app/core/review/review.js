var _ = require('lodash');
var ranking = require('./ranking');
var PullRequest = require('app/core/models').get('PullRequest');

/**
 * Runs next ranker from rankers list or resolve with ranking result.
 *
 * @param {Object} review
 * @param {Function[]} rankers
 * @param {Function} resolve
 * @param {Function} reject
 */
function addNextRanker(review, rankers, resolve, reject) {
    var ranker = rankers.splice(0, 1)[0];

    ranker(review).then(function (resultReview) {
        if (rankers.length === 0) {
            resolve(resultReview);
            return;
        }

        addNextRanker(resultReview, rankers, resolve);
    }, reject);
}

/**
 * Starts ranking queue.
 *
 * @param {Number} pullRequestId
 * @param {Function} reject
 *
 * @returns {Promise}
 */
function startQueue(pullRequestId, reject) {
    return PullRequest
        .findById(pullRequestId)
        .then(function (pullRequest) {
            if (!pullRequest) {
                reject('Pull Request with id = ' + pullRequestId + ' not found!');

                return;
            }

            return { pull: pullRequest, team: [] };
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
    var rankers = _.clone(ranking.get());

    return new Promise(function (resolve, reject) {
        var reviewQueue = startQueue(pullRequestId, reject);

        reviewQueue.then(function (resultReview) {
            addNextRanker(resultReview, rankers, resolve, reject);
        });
    });
};
