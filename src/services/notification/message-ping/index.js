import { filter, map } from 'lodash';

function message({ pullRequest }) {

  return `
Пулл реквест ожидает ревью:
#${pullRequest.number} – ${pullRequest.title}
${pullRequest.html_url}
`;

}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('notification.message.ping');
  const notification = imports.notification;

  function pingNotification(payload) {
    const reviewers = filter(
      payload.pullRequest.get('review.reviewers'),
      (reviewer) => !reviewer.approved
    );

    const body = message(payload);

    const promise = map(reviewers, (member) => {
      return notification.sendMessage(payload.pullRequest, member.login, body)
        .catch(logger.error.bind(logger));
    });

    return Promise.all(promise);
  }

  events.on('review:command:ping', pingNotification);

}
