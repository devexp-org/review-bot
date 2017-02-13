export class AbstractDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   * @param {Object} config
   */
  constructor(team, config) {
    this.name = team.name;
    this.config = config;
  }

  /**
   * Returns team members.
   *
   * @return {Promise.<Array.<User>>}
   */
  getMembers() {
    return Promise.reject(new Error('abstract method'));
  }

}

export class AbstractDriverFactory {

  /**
   * Returns driver config.
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
   * @param {Object} config
   */
  makeDriver(team, config) {
    throw new Error('abstract method');
  }

}
