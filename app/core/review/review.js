import _ from 'lodash';

import ranking from './ranking';
import { PullRequest } from 'app/core/models';

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

function startQueue(pullRequestId, reject) {
    return PullRequest
        .findById(pullRequestId)
        .then((pullRequest) => {
            if (!pullRequest) reject(`Pull Request with id = ${pullRequestId} not found!`);

            return { pull: pullRequest, team: [] };
        });
}

export default function reviewQ(pullRequestId) {
    var rankers = _.clone(ranking.get());

    return new Promise((resolve, reject) => {
        var reviewQueue = startQueue(pullRequestId, reject);

        reviewQueue.then((review) => {
            addNextRanker(review, rankers, resolve, reject);
        });
    });
}
