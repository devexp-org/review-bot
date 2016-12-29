import { cloneDeep } from 'lodash';
import { StaticDriver, StaticDriverFactory } from '../driver-static/class';

export default class YandexStaffDriver extends StaticDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   * @param {Object} driverConfig
   * @param {Object} staff - yandex staff module
   */
  constructor(team, driverConfig, staff) {
    super(team);

    if (!driverConfig.groupId) {
      throw new Error('Required parameter "groupId" is not given');
    }

    this.groupId = driverConfig.groupId;
    this.staff = staff;
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
  findTeamMember(login) {
    return this.staff
      .apiUserInfo(login)
      .then(user => this.staff._addAvatarAndUrl(user));
  }

}

export class YandexStaffDriverFactory extends StaticDriverFactory {

  constructor(staff) {
    super();

    this.staff = staff;
  }

  config() {
    return {
      groupId: {
        type: 'number'
      }
    };
  }

  makeDriver(team, driverConfig) {
    return new YandexStaffDriver(team, driverConfig, this.staff);
  }

}
