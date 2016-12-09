function message(link) {
  return `Документацию можно найти по адресу: ${link}`;
}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('notify');
  const notification = imports.notification;

  function helpNotification(payload, link) {
    const login = payload.comment.user.login;

    return notification(login, message(link))
      .catch(logger.error.bind(logger));
  }

  events.on('review:command:help', helpNotification);

  return {};

}
