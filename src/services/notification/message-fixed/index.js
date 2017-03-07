import { get } from 'lodash';

export function message({ pullRequest }) {
  const pullRequestAuthor = get(pullRequest, 'user.login');

  return `
Автор пулл реквеста исправил замечания:
#${pullRequest.number} – ${pullRequest.title}
${pullRequest.html_url}

Автор: @${pullRequestAuthor}
Добавлено: ${pullRequest.additions}
Удалено: ${pullRequest.deletions}
Файлов затронуто: ${pullRequest.changed_files}
Коммитов: ${pullRequest.commits}
`;

}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('notification.message.fixed');
  const notification = imports.notification;

  function fixedNotification(payload) {
    const body = message(payload);
    const send = (login) => {
      return notification.sendMessage(payload.pullRequest, login, body);
    };

    const users = payload.pullRequest.get('review.reviewers');

    const promise = users
      .filter(user => !user.approved)
      .map(user => send(user.login));

    return Promise.all(promise).catch(logger.error.bind(logger));
  }

  events.on('review:fixed', fixedNotification);

}
