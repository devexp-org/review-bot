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

  const model = imports.model;
  const UserModel = model('user');

  return function send(team, addressee, message) {

    return UserModel.findByLogin(addressee)
      .then(user => {
        if (!user) {
          throw new Error(`The user '${addressee}" is not found`);
        }

        const serviceName = getServiceName(team.notification);
        const sendService = imports[serviceName];

        if (!sendService) {
          throw new Error(`The transport '${serviceName}" is not found`);
        }

        sendService(user, message);
      });
  };

}
