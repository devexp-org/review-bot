import { get, find, cloneDeep } from 'lodash';

export class StaticDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   */
  constructor(team) {
    this.name = team.name;
    this.members = team.members || [];
    this.options = team.reviewConfig || {};
  }

  /**
   * Returns review option.
   *
   * @param {String} option
   * @param {String|Number} defaultValue
   *
   * @return {String|Number}
   */
  getOption(option, defaultValue) {
    return get(this.options, option, defaultValue);
  }

  /**
   * Returns candidates for review.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise.<Array.<Reviewer>>}
   */
  getCandidates(pullRequest) {
    return Promise.resolve(cloneDeep(this.members));
  }

  /**
   * Find reviewer by `pull request` and `login`.
   *
   * @param {PullRequest} pullRequest
   * @param {String} login
   *
   * @return {Promise.<Reviewer>}
   */
  findTeamMember(pullRequest, login) {
    return this.getCandidates()
      .then(team => find(team, { login }));
  }

}

export class StaticDriverFactory {

  /**
   * Returns static driver.
   *
   * @param {Team} team
   *
   * @return {TeamDriver}
   */
  makeDriver(team) {
    return new StaticDriver(team);
  }

}
