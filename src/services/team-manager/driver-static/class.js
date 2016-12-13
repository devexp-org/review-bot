import { get, find } from 'lodash';

export class StaticDriver {

  /**
   * @constructor
   *
   * @param {Object} team
   * @param {TeamModel} TeamModel
   */
  constructor(team, TeamModel) {
    this.name = team.name;
    this.options = team.reviewConfig;

    this.TeamModel = TeamModel;
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
   * @return {Promise.<Array.<Reviewer>>}
   */
  getCandidates() {
    return this.TeamModel
      .findByNameWithMembers(this.name)
      .then(team => team.members);
  }

  /**
   * Finds reviewer by `pull request` and `login`.
   *
   * @param {String} login
   *
   * @return {Promise.<Reviewer>}
   */
  findTeamMember(login) {
    return this.getCandidates()
      .then(team => find(team, { login }));
  }

}

export class StaticDriverFactory {

  /**
   * @constructor
   *
   * @param {TeamModel} TeamModel
   */
  constructor(TeamModel) {
    this.TeamModel = TeamModel;
  }

  name() {
    return 'static';
  }

  config() {
    return {};
  }

  /**
   * Returns static driver.
   *
   * @param {Team} team
   *
   * @return {TeamDriver}
   */
  makeDriver(team) {
    return new StaticDriver(team, this.TeamModel);
  }

}
