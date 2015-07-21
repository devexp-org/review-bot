import _ from 'lodash';

import logger, { pullInfoLogger } from 'app/modules/logger';
import team from 'app/modules/team';
import ranking from './ranking';
import * as models from 'app/modules/models';
import catchHandler from 'app/modules/utils/catch_handler';
import devExpErr from 'app/modules/utils/error';

const PullRequest = models.get('PullRequest');
const Err = devExpErr('app/modules/review/review');

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
        .then(team => {
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
    _.forEach(review.team, member => {
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
    return new Promise((resolve, reject) => {
        PullRequest
            .findById(pullRequestId)
            .then(pullRequest => {
                if (!pullRequest) {
                    return reject(new Err('PULL', 'Not found', pullRequestId));
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
export default function review(pullRequestId) {
    const rankers = ranking.get();

    let reviewQueue = startQueue(pullRequestId)
        .then(getTeam)
        .then(addZeroRank);

    _.forEach(rankers, ranker => {
        reviewQueue = reviewQueue.then(review => {
            logger.info('Choose reviewer step: ', ranker.name);
            return ranker(review);
        });
    });

    reviewQueue = reviewQueue
        .then(review => {
            pullInfoLogger('Choosing reviewers complete', review.pull);
            logger.info(
                'Reviewers are: ' + (
                    review.team ?
                        review.team.map(function (r) { return r.login + ' rank: ' + r.rank + ' '; }) :
                        'ooops no reviewers were selected...'
                )
            );

            return review;
        })
        .catch(catchHandler);

    return reviewQueue;
}

/**
 * Review.
 *
 * @typedef {Object} Review
 * @property {Array} team - Team members for review.
 * @property {Object} pull - Pull Request.
 */
