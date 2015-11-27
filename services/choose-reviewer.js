'use strict';

import { isEmpty } from 'lodash';

export class Review {

  /**
   * @constructor
   *
   * @param {Object} payload
   */
  constructor(payload) {
    this.payload = payload;

    this.team = payload.team;
    this.steps = payload.steps;
    this.logger = payload.logger;
    this.pullRequestModel = payload.pullRequestModel;
  }

  /**
   * Get team for pull request.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  findTeam(review) {
    return this.team
      .findByPullRequest(review.pullRequest)
      .then(team => {
        review.team = team;
        return review;
      });
  }

  /**
   * Find choose reviewer steps for team.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  findSteps(review) {
    return this.steps(review.pullRequest)
      .then(steps => {
        review.steps = steps;
        return review;
      });
  }

  /**
   * Add zero rank for every reviewer.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  addZeroRank(review) {
    review.team.forEach(member => { member.rank = 0; });

    return Promise.resolve(review);
  }

  /**
   * Start ranking queue.
   *
   * @param {Number} pullId - pull request id
   *
   * @return {Promise}
   */
  start(pullId) {
    return new Promise((resolve, reject) => {
      this.pullRequestModel
        .findById(pullId)
        .then(pullRequest => {
          if (!pullRequest) {
            return reject(new Error(`Pull request #${pullId} not found`));
          }

          resolve({ pullRequest, team: [] });
        });
    });
  }

  /**
   * Build queue from steps.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  stepsQueue(review) {
    return review.steps.reduce((queue, ranker) => {
      return queue.then(review => {
        this.logger.info('choose reviewer phase is `%s`', ranker.name);

        return ranker(review, this.payload);
      });
    }, Promise.resolve(review));
  }

  /**
   * Main review suggestion method.
   * Create queue of promises from processor and retrun suggested reviewers.
   *
   * @param {Number} pullId
   *
   * @return {Promise}
   */
  review(pullId) {
    this.logger.info('Review started');

    return this
      .start(pullId)
      .then(::this.findSteps)
      .then(::this.findTeam)
      .then(::this.addZeroRank)
      .then(::this.stepsQueue)
      .then(review => {
        this.logger.info(
          'Choose reviewers complete [%s — %s] %s',
          review.pullRequest.id,
          review.pullRequest.title,
          review.pullRequest.html_url
        );

        this.logger.info('Reviewers are: %s',
          (!isEmpty(review.team)) ?
            review.team.map(x => x.login + '#' + x.rank).join(' ') :
            'ooops, no reviewers were selected...'
        );

        return review;
      });
  }

}

export default function (options, imports) {

  const { team, model, logger, steps } = imports;

  const payload = {
    steps,
    team,
    logger,
    pullRequestModel: model.get('pull_request')
  };

  const service = new Review(payload);

  return Promise.resolve({ service });

}

/**
 * Review.
 *
 * @typedef {Object} Review
 *
 * @property {Object} pullRequest - Pull Request.
 * @property {Array}  team - Team members for review.
 * @property {Array}  steps - Steps for choosing reviewer.
 */
