import { AbstractDriver, AbstractDriverFactory } from '../driver-abstract/class';

export class StaticDriver extends AbstractDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   * @param {TeamManager} manager
   * @param {Object} driverConfig
   * @param {TeamModel} TeamModel
   */
  constructor(team, manager, driverConfig, TeamModel) {
    super(team, manager, driverConfig);

    this.TeamModel = TeamModel;
  }

  /**
   * @override
   */
  getCandidates() {
    return this.TeamModel
      .findByNameWithMembers(this.name)
      .then(team => team.members);
  }

}

export class StaticDriverFactory extends AbstractDriverFactory {

  /**
   * @constructor
   *
   * @param {TeamModel} TeamModel
   */
  constructor(TeamModel) {
    super();

    this.TeamModel = TeamModel;
  }

  /**
   * @override
   */
  config() {
    return {};
  }

  /**
   * @override
   */
  makeDriver(team, manager, driverConfig) {
    return new StaticDriver(team, manager, driverConfig, this.TeamModel);
  }

}
