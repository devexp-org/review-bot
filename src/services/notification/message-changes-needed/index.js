import { get } from 'lodash';

export function message({ pullRequest, login }) {
  return `
Пулл реквест требует исправлений:
#${pullRequest.number} – ${pullRequest.title}
${pullRequest.html_url}

Ревьювер: @${login}
`;

}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('notification.message.changes-needed');
  const notification = imports.notification;

  function changesNeededNotification(payload) {
    const body = message(payload);
    const login = get(payload.pullRequest, 'user.login');

    notification.sendMessage(payload.pullRequest, login, body)
      .catch(logger.error.bind(logger));
  }

  events.on('review:changesneeded', changesNeededNotification);

}
