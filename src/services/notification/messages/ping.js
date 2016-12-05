import { filter, map } from 'lodash';

function message({ pullRequest }) {

  return `
Reminder! You have to review pull request.
#${pullRequest.number} – ${pullRequest.title}
${pullRequest.html_url}
`;

}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('notify');
  const notification = imports.notification;

  function pingNotification(payload) {
    const reviewers = filter(
      payload.pullRequest.get('review.reviewers'),
      (reviewer) => !reviewer.approved
    );

    const body = message(payload);

    const promise = map(reviewers, (member) => {
      return notification(member.login, body)
        .catch(logger.error.bind(logger));
    });

    return Promise.all(promise);
  }

  events.on('review:command:ping', pingNotification);

  return {};

}
