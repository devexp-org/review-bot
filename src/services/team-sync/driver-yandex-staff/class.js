import { cloneDeep } from 'lodash';
import { AbstractDriver, AbstractDriverFactory } from '../driver-abstract/class';

export default class YandexStaffDriver extends AbstractDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   * @param {Object} config
   * @param {Object} staff - yandex staff module
   */
  constructor(team, config, staff) {
    super(team, config);

    if (!config.groupId) {
      throw new Error('Required parameter "groupId" is not given');
    }

    this.staff = staff;
    this.groupId = config.groupId;
  }

  /**
   * @override
   */
  getMembers() {
    return this.staff
      .getUsers(this.groupId)
      .then(team => cloneDeep(team));
  }

}

export class YandexStaffDriverFactory extends AbstractDriverFactory {

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

  makeDriver(team, config) {
    return new YandexStaffDriver(team, config, this.staff);
  }

}
