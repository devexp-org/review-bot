function getServiceName(transport) {
  return 'notification-' + transport;
}

/**
 * Notification service
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {Function}
 */
export default function setup(options, imports) {

  const teamManager = imports['team-manager'];

  /**
   *
   * @param {PullRequest} pullRequest
   * @param {String} addressee
   * @param {String} message
   *
   * @return {Promise}
   */
  return function send(pullRequest, addressee, message) {

    return teamManager.findTeamByPullRequest(pullRequest)
      .then(team => {
        if (!team) {
          throw new Error(`The team for ${pullRequest} is not found`);
        }

        const transport = team.getOption('notification');
        const serviceName = getServiceName(transport);
        const sendService = imports[serviceName];

        if (!sendService) {
          throw new Error(`The transport '${serviceName}" is not found`);
        }

        return team
          .findTeamMember(addressee)
          .then(user => {
            if (!user) {
              throw new Error(`The user '${addressee}" is not found in team ${team.name}`);
            }

            sendService(user, message);
          });
      });

  };

}
