import { cloneDeep } from 'lodash';
import { StaticDriver, StaticDriverFactory } from '../driver-static/class';

export default class YandexStaffDriver extends StaticDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   * @param {TeamManager} manager
   * @param {Object} driverConfig
   * @param {Object} staff - yandex staff module
   */
  constructor(team, manager, driverConfig, staff) {
    super(team, manager, driverConfig);

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

}

export class YandexStaffDriverFactory extends StaticDriverFactory {

  constructor(staff) {
    super();

    this.staff = staff;
  }

  config() {
    return {
      groupId: {
        type: ['number']
      }
    };
  }

  makeDriver(team, manager, driverConfig) {
    return new YandexStaffDriver(team, manager, driverConfig, this.staff);
  }

}
