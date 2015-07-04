import _ from 'lodash';

import ranking from './ranking';
import { PullRequest } from 'app/core/models';

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

    ranker(review).then((resultReview) => {
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
        .then((pullRequest) => {
            if (!pullRequest) reject(`Pull Request with id = ${pullRequestId} not found!`);

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
export default function review(pullRequestId) {
    var rankers = _.clone(ranking.get());

    return new Promise((resolve, reject) => {
        var reviewQueue = startQueue(pullRequestId, reject);

        reviewQueue.then((resultReview) => {
            addNextRanker(resultReview, rankers, resolve, reject);
        });
    });
}
