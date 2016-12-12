import { get, chain } from 'lodash';

export function message(payload, absenceUsers) {
  const pullRequest = payload.pullRequest;

  return `
Reviewers are absent: ${absenceUsers}. You may change them to somebody else.
#${pullRequest.number} – ${pullRequest.title}
${pullRequest.html_url}
`;

}

export default function setup(options, imports) {

  const staff = imports['yandex-staff'];
  const events = imports.events;
  const logger = imports.logger.getLogger('notify');
  const notification = imports.notification;

  function absenceNotification(payload) {

    const login = payload.pullRequest.get('user.login');

    const reviewers = payload.pullRequest.get('review.reviewers');

    return Promise
      .all(reviewers.map(user => staff.apiAbsence(user.login)))
      .then(absenceUsers => {

        const excludeTrip = (user) => get(user, 'gap_type__name') !== 'trip';

        absenceUsers = chain(absenceUsers)
          .flatten()
          .filter(excludeTrip)
          .map('staff__login')
          .value();

        if (absenceUsers.length) {
          notification(login, message(payload, absenceUsers))
            .catch(logger.error.bind(logger));
        }

      });
  }

  events.on('review:command:start', absenceNotification);

  return {};

}
