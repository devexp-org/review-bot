function messageToAuthor({ pullRequest }) {

  return `
Ваш пулл реквест ожидает правок:
#${pullRequest.number} – ${pullRequest.title}
${pullRequest.html_url}
`;

}

function messageToReviewer({ pullRequest }) {

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
    const pullRequest = payload.pullRequest;
    const pullRequestStatus = pullRequest.get('review.status');

    if (pullRequest.state !== 'open') {
      logger.warn('Ping for closed pull request %s', pullRequest);
      return Promise.resolve();
    }

    if (pullRequestStatus === 'changesneeded') {

      const body = messageToAuthor(payload);
      const author = pullRequest.get('user.login');

      return notification.sendMessage(pullRequest, author, body)
        .catch(logger.error.bind(logger));

    } else if (pullRequestStatus === 'inprogress') {

      const body = messageToReviewer(payload);
      const reviewers = pullRequest.get('review.reviewers')
        .filter(reviewer => !reviewer.approved)
        .map(reviewer => reviewer.login);

      const promise = reviewers.map(login => {
        return notification.sendMessage(pullRequest, login, body);
      });

      return Promise.all(promise).catch(logger.error.bind(logger));
    }

  }

  events.on('review:command:ping', pingNotification);

}
