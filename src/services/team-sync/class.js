import { find } from 'lodash';

export default class TeamSync {

  /**
   * @constructor
   *
   * @param {Object} drivers
   * @param {UserModel} UserModel
   * @param {TeamModel} TeamModel
   */
  constructor(drivers, UserModel, TeamModel) {
    this.drivers = drivers;

    this.UserModel = UserModel;
    this.TeamModel = TeamModel;
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
   * Returns driver for given team.
   *
   * @param {String} teamName
   *
   * @return {TeamDriver}
   */
  getTeamDriver(teamName) {
    return this.TeamModel
      .findByName(teamName)
      .then(team => {
        const driverName = team.driver && team.driver.name;
        const driverConfig = team.driver && team.driver.options || {};
        const driverFactory = this.drivers[driverName];

        if (!driverFactory) {
          throw new Error(`Unknown driver '${driverName}' of '${teamName}'`);
        }

        return driverFactory.makeDriver(team, driverConfig);
      });
  }

  /**
   * Synchronizes given user.
   *
   * @param {User} remote
   *
   * @return {Promise.<User>}
   */
  syncUser(remote) {
    return this.UserModel.findByLogin(remote.login)
      .then(local => {
        if (!local) {
          local = new this.UserModel({ login: remote.login });
        }

        local.html_url = remote.html_url || local.html_url;
        local.avatar_url = remote.avatar_url || local.avatar_url;

        (remote.contacts || []).forEach(contact => {
          const item = { id: contact.id, account: contact.account };
          const hasContact = find(local.contacts, item);

          if (!hasContact) {
            local.contacts.push(contact);
          }
        });

        return local.save();
      });
  }

  /**
   * Synchronizes given team.
   *
   * @param {String} teamName
   *
   * @return {Promise.<Team>}
   */
  syncTeam(teamName) {
    return this.getTeamDriver(teamName)
      .then(driver => driver.getMembers())
      .then(items => {
        return Promise.all(items.map(member => {
          return this.teamManager.findTeamMember(member.login);
        }));
      })
      .then(items => {
        return Promise.all(items.map(user => {
          return this.syncUser(user);
        }));
      })
      .then(members => {
        return this.TeamModel.findByName(teamName)
          .then(team => {
            team.set('members', members);
            return team.save();
          });
      });
  }

}
