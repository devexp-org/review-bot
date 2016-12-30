import { get, chain } from 'lodash';

export function message(payload, absenceUsers) {
  const isPlural = absenceUsers.length > 1;
  const pullRequest = payload.pullRequest;

  return `
${isPlural ? 'Ревьюверы' : 'Ревьювер'}: ${absenceUsers.join(', ')} ${isPlural ? 'отсутствуют' : 'отсутствует'},
что может замедлить ревью. Можно заменить отсутствующих ревьюверов с помощью команды /change
#${pullRequest.number} – ${pullRequest.title}
${pullRequest.html_url}
`;

}

export default function setup(options, imports) {

  const staff = imports['yandex-staff'];
  const events = imports.events;
  const logger = imports.logger.getLogger('notification.message.absence');
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
          notification.sendMessage(
              payload.pullRequest, login, message(payload, absenceUsers)
            )
            .catch(logger.error.bind(logger));
        }

      });
  }

  events.on('review:command:start', absenceNotification);

}
