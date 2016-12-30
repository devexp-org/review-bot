import { get, map } from 'lodash';

export function message({ pullRequest }) {
  const pullRequestAuthor = get(pullRequest, 'user.login');

  return `
Вы были назначены ревьювером пулл реквеста:
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
  const logger = imports.logger.getLogger('notification.message.start');
  const notification = imports.notification;

  function startNotification(payload) {
    const reviewers = payload.pullRequest.get('review.reviewers');

    const body = message(payload);

    const promise = map(reviewers, (member) => {
      return notification(payload.pullRequest, member.login, body)
        .catch(logger.error.bind(logger));
    });

    return Promise.all(promise);
  }

  events.on('review:started', startNotification);

}
