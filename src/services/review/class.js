import { flatten, forEach, isEmpty } from 'lodash';

export default class ReviewerAssignment {

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
        notFound = new Error(`There is no step with name "${name}"`);
      }

      return { ranker, name };
    });

    return notFound ? Promise.reject(notFound) : Promise.resolve(steps);
  }

  /**
   * Add zero rank for every reviewer.
   *
   * @param {Review} review
   *
   * @return {Promise.<Review>}
   */
  addZeroRank(review) {
    forEach(review.members, (member) => { member.rank = 0; });

    return Promise.resolve(review);
  }

  /**
   * Start ranking queue.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise.<Review>}
   */
  start(pullRequest) {
    return Promise.resolve({ pullRequest, members: [] });
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

    const promise = review.steps.map(({ ranker, name }) => {
      return ranker(review, stepsOptions[name]);
    });

    return Promise.all(promise)
      .then(ranks => {
        return { review, ranks };
      });
  }

  countRanks({ review, ranks }) {
    const members = {};

    flatten(ranks).forEach(member => {

      if (!members[member.login]) {
        members[member.login] = 0;
      }

      if (Number.isFinite(members[member.login])) {
        members[member.login] += member.rank;
      }

    });

    review.ranks = Object.keys(members)
      .sort((a, b) => {
        if (members[a] === Infinity) {
          return -1;
        } else if (members[a] === -Infinity) {
          return 1;
        } else if (members[b] === Infinity) {
          return 1;
        } else if (members[b] === -Infinity) {
          return -1;
        }

        return members[b] - members[a];
      })
      .map(login => {
        return { login, rank: members[login] };
      });

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
    this.logger.info('Review started for #s', pullRequest.id);

    return this
      .start(pullRequest)
      .then(this.setTeam.bind(this))
      .then(this.setSteps.bind(this))
      .then(this.addZeroRank.bind(this))
      .then(this.stepsQueue.bind(this))
      .then(this.countRanks.bind(this))
      .then(review => {
        this.logger.info('Complete %s', review.pullRequest);

        this.logger.info('Reviewers are: %s',
          isEmpty(review.members)
            ? 'ooops, no reviewers were selected...'
            : review.members.map(x => x.login + '#' + x.rank).join(' ')
        );

        return review;
      });
  }

}
