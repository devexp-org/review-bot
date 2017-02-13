export default class UserSeach {

  /**
   * @constructor
   *
   * @param {Object} drivers
   * @param {String} defaultDriver
   */
  constructor(drivers, defaultDriver) {
    this.drivers = drivers;
    this.defaultDriver = drivers[defaultDriver];
  }

  /**
   * Returns all drivers.
   *
   * @return {Array.<TeamDriver>}
   */
  getDrivers() {
    return this.drivers;
  }

  /**
   * Find user by login.
   *
   * @param {String} login
   * @param {String} driverName
   *
   * @return {User}
   */
  findByLogin(login, driverName) {
    const driver = this.drivers[driverName] || this.defaultDriver;

    return driver.findByLogin(login);
  }

}
