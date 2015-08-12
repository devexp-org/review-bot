'use strict';

export default class Review {

  /**
   * @constructor
   *
   * @param {Array<Function>} steps — functions which returns promise which resolve with { pull, team } object.
   * @param {Object} payload
   */
  constructor(steps, payload) {
    if (!Array.isArray(steps)) {
      throw new Error('No stages provided');
    }
    this.steps = steps;
    this.payload = payload;

    this.team = payload.team;
    this.logger = payload.logger;
    this.pullRequestModel = payload.pullRequestModel;
  }

  /**
   * Return registred processors for futher using.
   *
   * @return {Array<Function>}
   */
  get() {
    return this.steps;
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
   * Main review suggestion method.
   * Create queue of promises from processor and retrun suggested reviewers.
   *
   * @param {Number} pullId
   *
   * @return {Promise}
   */
  review(pullId) {
    const rankers = this.get();

    this.logger.info('Review started');

    let reviewQueue = this
      .start(pullId)
      .then(::this.findTeam)
      .then(::this.addZeroRank);

    reviewQueue = rankers.reduce((queue, ranker) => {
      return queue.then(review => {
        this.logger.info('choose reviewer phase is `%s`', ranker.name);

        return ranker(review, this.payload);
      });
    }, reviewQueue);

    return reviewQueue
      .then(review => {
        this.logger.info(
          'Choose reviewers complete [%s — %s] %s',
          review.pullRequest.id,
          review.pullRequest.title,
          review.pullRequest.html_url
        );

        this.logger.info('Reviewers are: %s',
          review.team
              ? review.team.map(x => x.login + '#' + x.rank).join(' ')
              : 'ooops, no reviewers were selected...'
        );

        return review;
      });
  }

}

export default function (options, imports) {

  const team = imports.team;
  const model = imports.model;
  const logger = imports.logger;

  const payload = {
    team,
    logger,
    pullRequestModel: model.get('pull_request')
  };

  const steps = options.steps.map(path => {
    const ranker = require(path);
    return ranker(options.stepOptions[ranker.name]);
  });

  const service = new Review(steps, payload);

  return Promise.resolve({ service });

}

/**
 * Review.
 *
 * @typedef {Object} Review
 *
 * @property {Object} pull - Pull Request.
 * @property {Array}  team - Team members for review.
 */
