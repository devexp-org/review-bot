import { AbstractDriver, AbstractDriverFactory } from '../driver-abstract/class';

export class StaticDriver extends AbstractDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   * @param {Object} config
   * @param {TeamModel} TeamModel
   */
  constructor(team, config, TeamModel) {
    super(team, config);

    this.TeamModel = TeamModel;
  }

  /**
   * @override
   */
  getMembers() {
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
  makeDriver(team, config) {
    return new StaticDriver(team, config, this.TeamModel);
  }

}
