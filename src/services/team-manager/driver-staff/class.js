import { cloneDeep } from 'lodash';
import { StaticDriver, StaticDriverFactory } from '../driver-static/class';

export default class YandexStaffDriver extends StaticDriver {

  /**
   * @constructor
   *
   * @param {Object} team
   * @param {Object} driverConfig
   * @param {Object} staff - yandex staff module
   * @param {Object} TeamModel
   * @param {Object} UserModel
   */
  constructor(team, driverConfig, staff, TeamModel, UserModel) {
    super(team);

    this.staff = staff;
    this.groupId = driverConfig.groupId;

    this.TeamModel = TeamModel;
    this.UserModel = UserModel;
  }

  /**
   * @override
   */
  getCandidates() {
    return this.staff
      .getUsersInOffice(this.groupId)
      .then(team => cloneDeep(team));
  }

  /**
   * @override
   */
  findTeamMember(pullRequest, login) {
    return this.staff
      .apiUserInfo(login)
      .then(user => this.staff._addAvatarAndUrl(user));
  }

}

export class YandexStaffDriverFactory extends StaticDriverFactory {

  constructor(staff, TeamModel, UserModel) {
    super();

    this.staff = staff;
    this.TeamModel = TeamModel;
    this.UserModel = UserModel;
  }

  makeDriver(team, driverConfig) {
    return new YandexStaffDriver(
      team, driverConfig, this.staff, this.TeamModel, this.UserModel
    );
  }

  name() {
    return 'yandex-staff';
  }

  config() {
    return {
      groidId: {
        type: 'number'
      }
    };
  }

}
