import { get, find, cloneDeep } from 'lodash';

export default class AbstractDriver {

  makeDriver(team, config) {
    return new AbstractDriverFrontEnd(team, config);
  }

}

export class AbstractDriverFrontEnd {

  constructor(team, config) {
    this.name = team.name;
    this.options = team.reviewConfig || {};
    this.members = team.members || [];
  }

  /**
   * Returns option for review.
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
   * Returns "active" developers who may be chosen to review.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise.<Array.<Developer>>}
   */
  getMembersForReview(pullRequest) {
    return Promise.resolve(cloneDeep(this.members));
  }

  /**
   * Find team member by login.
   * The member is not necessary to be an "active member" returned from `getMembersForReview`
   *
   * @param {PullRequest} pullRequest
   * @param {String} login
   *
   * @return {Promise.<Developer>}
   */
  findTeamMember(pullRequest, login) {
    return this.getMembersForReview()
      .then(team => find(team, { login }));
  }

}


