export function message({ pullRequest }) {

  return `
Review completed.
#${pullRequest.number} – ${pullRequest.title}
${pullRequest.html_url}
`;

}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('notification.message.complete');
  const notification = imports.notification;

  function completeNotification(payload) {
    const login = payload.pullRequest.get('user.login');

    return notification(payload.pullRequest, login, message(payload))
      .catch(logger.error.bind(logger));
  }

  events.on('review:complete', completeNotification);

}
