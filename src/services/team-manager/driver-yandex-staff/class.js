import { cloneDeep } from 'lodash';
import { StaticDriver, StaticDriverFactory } from '../driver-static/class';

export default class YandexStaffDriver extends StaticDriver {

  /**
   * @constructor
   *
   * @param {Object} team
   * @param {Object} driverConfig
   * @param {Object} yandexStaff - yandex staff module
   */
  constructor(team, driverConfig, yandexStaff) {
    super(team);

    if (!driverConfig.groupId) {
      throw new Error('Required parameter "groupId" is not given');
    }

    this.groupId = driverConfig.groupId;
    this.yandexStaff = yandexStaff;
  }

  /**
   * @override
   */
  getCandidates() {
    return this.yandexStaff
      .getUsersInOffice(this.groupId)
      .then(team => cloneDeep(team));
  }

  /**
   * @override
   */
  findTeamMember(login) {
    return this.yandexStaff
      .apiUserInfo(login)
      .then(user => this.yandexStaff._addAvatarAndUrl(user));
  }

}

export class YandexStaffDriverFactory extends StaticDriverFactory {

  constructor(yandexStaff) {
    super();

    this.yandexStaff = yandexStaff;
  }

  name() {
    return 'yandex-staff';
  }

  config() {
    return {
      groupId: {
        type: 'number'
      }
    };
  }

  makeDriver(team, driverConfig) {
    return new YandexStaffDriver(team, driverConfig, this.yandexStaff);
  }

}
