import { get } from 'lodash';

export default class TeamDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   * @param {UserSearch} userSearch
   */
  constructor(team, userSearch) {
    this.team = team;
    this.options = team.reviewConfig;
    this.userSearch = userSearch;

    this._searchDriver = team.searchDriver;
  }

  /**
   * Returns team name.
   *
   * @return {String}
   */
  getName() {
    return this.team.name;
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
   * @return {Promise.<Array.<User>>}
   */
  getCandidates(pullRequest) {
    return Promise.resolve(this.team.members.slice());
  }

  /**
   * Finds member by `login`.
   *
   * @param {String} login
   *
   * @return {Promise.<User>}
   */
  findTeamMember(login) {
    return this.userSearch.findByLogin(login, this._searchDriver);
  }

}
