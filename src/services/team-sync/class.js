import { find } from 'lodash';

export default class TeamSync
{

  construct(userModel, teamModel, teamManager) {
    this.userModel = userModel;
    this.teamModel = teamModel;
    this.teamManager = teamManager;
  }

  syncUser(remote) {
    return this.userModel.findByLogin(remote.login)
      .then(local => {
        local.html_url = remote.html_url || local.html_url;
        local.avatar_url = remote.avatar_url || local.avatar_url;

        (remote.contacts || []).forEach(contact => {
          const item = { id: contact.id, account: contact.account };
          const hasContact = find(local.contacts, item);

          if (!hasContact) {
            local.contacts.push(contact);
          }
        });

        return local;
      });
  }

  syncTeam(teamName) {
    this.teamManager.getTeamDriver(teamName)
      .then(driver => driver.getCandidates())
      .then(members => {
        const promise = members.map(username => {
          return this.teamManager.search(username);
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
