import { chain, isEmpty } from 'lodash';

export default class Review {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {Object} imports
   */
  constructor(options, imports) {
    this.imports = imports;
    this.options = options;

    this.logger = imports.logger;
    this.teamDispatcher = imports['team-dispatcher'];
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
   * Get and then set team for pull request.
   *
   * @param {Review} review
   *
   * @return {Promise.<Review>}
   */
  setTeam(review) {
    const team = this.teamDispatcher.findTeamByPullRequest(review.pullRequest);

    if (!team) {
      return Promise.reject(new Error(
        `Team is not found for pull request ${review.pullRequest}`
      ));
    }

    review.team = team;

    review.banCount = review.team.getOption(
      'banCount', this.options.banCount
    );

    review.approveCount = team.getOption(
      'approveCount', this.options.approveCount
    );

    review.totalReviewers = team.getOption(
      'totalReviewers', this.options.totalReviewers
    );

    return team.getMembersForReview(review.pullRequest)
      .then(members => {
        review.members = members;

        return review;
      });
  }

  /**
   * Find choose reviewer steps for team.
   *
   * @param {Review} review
   *
   * @return {Promise.<Review>}
   */
  setSteps(review) {
    return this.getSteps(review)
      .then(steps => {
        review.steps = steps;

        return review;
      });
  }

  /**
   * Get steps for team.
   *
   * @param {Review} review
   *
   * @return {Promise.<Array.<Function>>}
   */
  getSteps(review) {
    const stepNames = review.team.getOption('steps', this.options.steps);

    if (isEmpty(stepNames)) {
      return Promise.reject(new Error('There are no any steps for given team'));
    }

    let notFound = false;

    const steps = stepNames.map(name => {
      const ranker = this.imports['review-step-' + name];

      if (!ranker && !notFound) {
        notFound = new Error(`There is no step "${name}"`);
      }

      return { ranker, name };
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
  stepsQueue(review) {
    const stepsOptions = review.team.getOption(
      'stepsOptions', this.options.stepsOptions || {}
    );

    review.ranks = [];

    return review.steps.reduce((promise, { ranker, name }) => {
      return promise.then(review => {
        return ranker(review, stepsOptions[name]).then(values => {
          this.logger.info('"%s" returns "%s"', name, JSON.stringify(values));

          review.ranks.push({ name, values });

          return review;
        });
      });
    }, Promise.resolve(review));
  }

  countRanks(review) {
    let members = {};
    let totalReviewers = review.totalReviewers;

    chain(review.ranks)
      .map('values')
      .flatten()
      .forEach(member => {
        if (!members[member.login]) {
          members[member.login] = 0;
        }

        if (Number.isFinite(members[member.login])) {
          members[member.login] += member.rank;
        }
      })
      .value();

    review.reviewers = chain(members)
      .keys(members)
      .sort((a, b) => members[b] - members[a])
      .map(login => {
        return { login, rank: members[login] };
      })
      .takeWhile(member => {
        return member.rank === Infinity || (totalReviewers--) > 0;
      })
      .value();

    return review;
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
      .then(this.stepsQueue.bind(this))
      .then(this.countRanks.bind(this))
      .then(review => {
        this.logger.info('Complete %s', review.pullRequest);

        this.logger.info('Reviewers are: %s',
          isEmpty(review.reviewers)
            ? 'ooops, no reviewers were selected...'
            : review.ranks.map(x => x.login + '#' + x.rank).join(' ')
        );

        return review;
      });
  }

}
