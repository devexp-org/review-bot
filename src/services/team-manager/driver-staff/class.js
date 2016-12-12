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
      .then(team => cloneDeep(team))
      .then(this.sync.bind(this));
  }

  /**
   * @override
   */
  findTeamMember(pullRequest, login) {
    return this.staff
      .apiUserInfo(login)
      .then(user => this.staff._addAvatarAndUrl(user));
  }

  sync(members) {
    return this.syncUsers(members).then(this.syncTeam.bind(this));
  }

  syncTeam(members) {
    return this.TeamModel.findByName(this.name)
      .then(team => {
        if (!team) {
          return members;
        }

        team.members = members;
        return team.save();
      })
      .then(() => members);
  }

  syncUsers(members) {
    const promise = map(members, (member) => {
      return this.UserModel
        .findByLogin(member.login)
        .then(user => {
          if (user) {
            return user;
          }

          user = new this.UserModel({
            login: member.login,
            contacts: [
              { id: 'email', account: member.login + '@yandex-team.ru' }
              { id: 'jabber', account: member.login + '@yandex-team.ru' }
            ]
          });
          return user.validate().then(user.save.bind(user));
        });
    });

    return Promise.all(promise);
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
