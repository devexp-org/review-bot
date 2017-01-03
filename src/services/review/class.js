import { merge, isEmpty } from 'lodash';

export default class Review {

  /**
   * @constructor
   *
   * @param {Array} steps
   * @param {Object} options
   * @param {Object} imports
   */
  constructor(steps, options, imports) {
    this.steps = steps;
    this.logger = imports.logger;
    this.options = options;
    this.teamManager = imports.teamManager;
  }

  /**
   * Returns all steps.
   *
   * @return {Object}
   */
  getSteps() {
    return this.steps;
  }

  /**
   * Start ranking queue.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise.<Review>}
   */
  start(pullRequest) {
    return Promise.resolve({ pullRequest });
  }

  /**
   * Get and set team for pull request.
   *
   * @param {Review} review
   *
   * @return {Promise.<Review>}
   */
  setTeam(review) {
    return this.teamManager.findTeamByPullRequest(review.pullRequest)
      .then(team => {
        if (!team) {
          return Promise.reject(new Error(
            `Team is not found for pull request ${review.pullRequest}`
          ));
        }

        review.team = team;

        review.approveCount = team.getOption(
          'approveCount', this.options.approveCount
        );

        review.totalReviewers = team.getOption(
          'totalReviewers', this.options.totalReviewers
        );

        return team.getCandidates(review.pullRequest)
          .then(members => {
            review.members = members;
            return review;
          });
      });
  }

  /**
   * Finds steps for team.
   *
   * @param {Review} review
   *
   * @return {Promise.<Review>}
   */
  setSteps(review) {
    return this.loadSteps(review)
      .then(steps => {
        review.steps = steps;
        return review;
      });
  }

  /**
   * Gets steps for team.
   *
   * @param {Review} review
   *
   * @return {Promise.<Array.<Function>>}
   */
  loadSteps(review) {
    let stepNames = review.team.getOption('steps');

    if (isEmpty(stepNames)) {
      stepNames = this.options.defaultSteps;
    }

    if (isEmpty(stepNames)) {
      return Promise.reject(new Error('There are no any steps for given team'));
    }

    let notFound = false;

    const steps = stepNames.map(name => {
      const ranker = this.steps[name];

      if (!ranker && !notFound) {
        notFound = new Error(`There is no step "${name}"`);
      }

      return { name, ranker };
    });

    return notFound ? Promise.reject(notFound) : Promise.resolve(steps);
  }

  /**
   * Build queue from steps.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  stepQueue(review) {
    const stepsOptions = merge(
      {},
      this.options.stepsOptions,
      review.team.getOption('stepsOptions')
    );

    const sortByRank = (a, b) => b.rank - a.rank;

    return review.steps.reduce((promise, { name, ranker }) => {
      return promise.then(review => {
        this.logger.info('review phase is `%s`', name);

        review.members.sort(sortByRank);

        return ranker.process(review, stepsOptions[name] || {});
      });
    }, Promise.resolve(review));
  }

  /**
   * Review suggestion method.
   * Create queue of promises from processor and retrun suggested reviewers.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise.<Review>}
   */
  choose(pullRequest) {
    this.logger.info('Review started %s', pullRequest);

    return this
      .start(pullRequest)
      .then(this.setTeam.bind(this))
      .then(this.setSteps.bind(this))
      .then(this.stepQueue.bind(this))
      .then(review => {
        this.logger.info('Complete %s', review.pullRequest);

        this.logger.info('Reviewers: %s',
          isEmpty(review.reviewers)
            ? 'ooops, no reviewers were selected...'
            : review.reviewers.map(x => x.login).join(' ')
        );

        return review;
      });
  }

}
