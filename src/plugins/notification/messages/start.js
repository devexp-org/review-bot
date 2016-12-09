import { map } from 'lodash';

export function message({ pullRequest }) {

  return `
You were assigned to review the pull request:
#${pullRequest.number} – ${pullRequest.title}
${pullRequest.html_url}
`;

}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('notify');
  const notification = imports.notification;

  function startNotification(payload) {
    const reviewers = payload.pullRequest.get('review.reviewers');

    const body = message(payload);

    const promise = map(reviewers, (member) => {
      return notification(member.login, body)
        .catch(logger.error.bind(logger));
    });

    return Promise.all(promise);
  }

  events.on('review:started', startNotification);

  return {};

}
