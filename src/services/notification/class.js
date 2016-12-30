export default class Notification {

  /**
   * @constructor
   *
   * @param {Array} transports
   * @param {TeamManager} teamManager
   */
  constructor(transports, teamManager) {
    this.transports = transports;
    this.teamManager = teamManager;
  }

  /**
   * Returns all transports.
   *
   * @return {Array.<NotificationTransport>}
   */
  getTransports() {
    return this.transports;
  }

  sendMessage(pullRequest, addressee, message) {

    return this.teamManager.findTeamByPullRequest(pullRequest)
      .then(team => {
        if (!team) {
          return Promise.reject(
            new Error(`The team for ${pullRequest} is not found`)
          );
        }

        const name = team.getOption('notification');

        if (!(name in this.transports)) {
          return Promise.reject(
            new Error(`The transport '${name}" is not found`)
          );
        }

        const transport = this.transports[name];

        return team
          .findTeamMember(addressee)
          .then(user => {
            if (!user) {
              return Promise.reject(
                new Error(`The user '${addressee}" is not found in team ${team.name}`)
              );
            }

            return transport.send(user, message);
          });
      });

  }

}
