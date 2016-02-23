import { filter, isEmpty } from 'lodash';

function message(payload) {
  const pullRequest = payload.pullRequest;

  return `Reminder! You have to review pull request: ${pullRequest.title} — ${pullRequest.html_url}.`;
}

export default function pingNotification(transport, payload) {
  const reviewers = filter(payload.pullRequest.review.reviewers, r => !r.approved);

  if (isEmpty(reviewers)) return;

  reviewers.forEach(member => {
    transport.send(member.login, message(payload));
  });
}
