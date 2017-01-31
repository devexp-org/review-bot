import { get } from 'lodash';

export class AbstractDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   * @param {TeamManager} manager
   * @param {Object} driverConfig
   */
  constructor(team, manager, driverConfig) {
    this.name = team.name;
    this.manager = manager;
    this.options = team.reviewConfig;
    this.driverConfig = driverConfig;
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
    return Promise.reject(new Error('abstract method'));
  }

  /**
   * Finds reviewer by `login`.
   *
   * @param {String} login
   *
   * @return {Promise.<User>}
   */
  findTeamMember(login) {
    return this.manager.findTeamMember(login);
  }

}

export class AbstractDriverFactory {

  /**
   * Returns config for driver.
   *
   * @return {Object}
   */
  config() {
    return {};
  }

  /**
   * Returns instance of driver.
   *
   * @param {Team} team
   * @param {TeamManager} manager
   * @param {Object} driverConfig
   */
  makeDriver(team, manager, driverConfig) {
    throw new Error('abstract method');
  }

}
