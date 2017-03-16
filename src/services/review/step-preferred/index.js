import { map, uniq, includes, difference, forEach } from 'lodash';
import AbstractReviewStep from '../step';

export const REVIEWER_RE = /(?:^|\W)@([a-z][-0-9a-z]+)(?:(?=\W|$))/gi;

export class PreferredReviewStep extends AbstractReviewStep {

  /**
   * @constructor
   *
   * @param {TeamManager} teamManager
   */
  constructor(teamManager) {
    super();

    this.teamManager = teamManager;
  }

  /**
   * Finds users in description
   *
   * @param {String} body
   *
   * @return {Array}
   */
  findReviewersInDescription(body) {
    let match;

    const reviewers = [];

    do {
      match = REVIEWER_RE.exec(body);
      if (match && match.length) {
        reviewers.push(match[1]);
      }
    } while (match !== null);

    return reviewers;
  }

  /**
   * Adds rank for preferred reviewers.
   *
   * @override
   *
   * @param {Review} review
   * @param {Object} options
   * @param {Number} options.max - max rank
   *
   * @return {Promise.<Review>}
   */
  process(review, options) {

    let promise = [];

    const body = review.pullRequest.body;

    const preferredReviewers = uniq(this.findReviewersInDescription(body));
    const unknownReviewers = difference(
      preferredReviewers,
      map(review.members, 'login')
    );

    forEach(review.members, (member) => {
      if (includes(preferredReviewers, member.login)) {
        member.rank += 500;
      }
    });

    if (!unknownReviewers.length) {
      return Promise.resolve(review);
    }

    return this.teamManager.findTeamByPullRequest(review.pullRequest)
      .then(team => {
        if (!team) {
          return Promise.reject(new Error(
            `Team is not found for pull request ${review.pullRequest}`
          ));
        }

        promise = unknownReviewers.map(login => {
          return team
            .findTeamMember(login)
            .then(user => {
              if (user) {
                review.members.push({ login: user.login, rank: 500 });
              }
            });
        });

        return Promise.all(promise).then(() => review);
      });

  }

}

/**
 * Create review `preferred` step.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {AbstractReviewStep}
 */
export default function setup(options, imports) {
  const teamManager = imports['team-manager'];

  return new PreferredReviewStep(teamManager);
}
