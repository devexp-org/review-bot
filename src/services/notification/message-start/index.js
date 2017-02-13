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
    const body = message(payload);
    const send = (login) => {
      return notification.sendMessage(payload.pullRequest, login, body);
    };

    if (payload.pullRequest.review.status !== 'inprogress') {
      return Promise.resolve();
    }

    const newReviewers = [].concat(payload.newReviewer).filter(Boolean);
    const allReviewers = payload.pullRequest.get('review.reviewers');
    const users = (newReviewers.length) ? newReviewers : allReviewers;

    const promise = map(users, (user) => send(user.login));

    return Promise.all(promise).catch(logger.error.bind(logger));
  }

  events.on('review:started', startNotification);
  events.on('review:command:add', startNotification);
  events.on('review:command:busy', startNotification);
  events.on('review:command:change', startNotification);
  events.on('review:command:replace', startNotification);

}
