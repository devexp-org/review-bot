function getServiceName(transport) {
  return 'notification-service-' + transport;
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
  const userModel = model('user');

  return function send(to, message) {

    return userModel.findByLogin(to)
      .then(user => {
        if (!user) {
          throw new Error(`${to} is not found`);
        }

        const userContacts = user.getContacts();

        for (let i = 0; i < userContacts.length; i++) {
          const contact = userContacts[i];
          const serviceName = getServiceName(contact.id);

          if (serviceName in imports) {
            const sendService = imports[serviceName];
            sendService(contact.account, message);
            break;
          }
        }
      });

  };

}
