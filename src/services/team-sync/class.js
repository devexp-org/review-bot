import { find } from 'lodash';

export default class TeamSync {

  constructor(UserModel, TeamModel, teamManager) {
    this.UserModel = UserModel;
    this.TeamModel = TeamModel;
    this.teamManager = teamManager;
  }

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

  syncTeam(teamName) {
    return this.teamManager.getTeamDriver(teamName)
      .then(driver => driver.getCandidates())
      .then(members => {
        const promise = members.map(member => {
          return this.teamManager.findTeamMember(member.login);
        });

        return Promise.all(promise);
      })
      .then(members => {
        const promise = members.map(user => {
          return this.syncUser(user);
        });

        return Promise.all(promise);
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
