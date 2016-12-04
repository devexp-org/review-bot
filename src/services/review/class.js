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
    this.teamManager = imports['team-manager'];
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
    const team = this.teamManager.findTeamByPullRequest(review.pullRequest);

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
        return ranker(review, stepsOptions[name]).then(ranks => {
          this.logger.info('"%s" returns "%s"', name, JSON.stringify(ranks));

          review.ranks.push({ name, ranks });

          return review;
        });
      });
    }, Promise.resolve(review));
  }

  countRanks(review) {
    let total = review.totalReviewers;
    let members = {};

    chain(review.ranks)
      .map('ranks')
      .flatten()
      .forEach(({ login, rank }) => {
        if (!members[login]) {
          members[login] = 0;
        }
        if (Number.isFinite(members[login])) {
          members[login] += rank;
        }
      })
      .value();


    review.reviewers = chain(members)
      .keys(members)
      .sort((a, b) => members[b] - members[a])
      .map((login, rank) => {
        return { login, rank: members[login] };
      })
      .filter(member => {
        if (member.rank === Infinity) {
          return true;
        } else if (member.rank === -Infinity) {
          return false;
        } else if ((total--) > 0) {
          return true;
        } else {
          return false;
        }
      })
      .map(member => {
        return { login: member.login };
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
            : review.reviewers.map(x => x.login).join(' ')
        );

        return review;
      });
  }

}
