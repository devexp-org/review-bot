import { find } from 'lodash';
import { AbstractDriver, AbstractDriverFactory } from '../driver-abstract/class';

export class StaticDriver extends AbstractDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   * @param {Object} driverConfig
   * @param {TeamModel} TeamModel
   */
  constructor(team, driverConfig, TeamModel) {
    super(team, driverConfig);

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

  /**
   * @override
   */
  findTeamMember(login) {
    return this.getCandidates()
      .then(team => find(team, { login }));
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
  makeDriver(team, driverConfig) {
    return new StaticDriver(team, driverConfig, this.TeamModel);
  }

}
