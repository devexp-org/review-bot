import { get } from 'lodash';

export class AbstractDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   * @param {Object} driverConfig
   */
  constructor(team, driverConfig) {
    this.name = team.name;
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
   * @return {Promise.<Array.<User>>}
   */
  getCandidates() {
    return Promise.reject(new Error('abstract method'));
  }

  /**
   * Finds reviewer by `pull request` and `login`.
   *
   * @param {String} login
   *
   * @return {Promise.<User>}
   */
  findTeamMember(login) {
    return Promise.reject(new Error('abstract method'));
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
   * @param {Object} driverConfig
   */
  makeDriver(team, driverConfig) {
    throw new Error('abstract method');
  }

}
