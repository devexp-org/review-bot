'use strict';

function message(payload) {
  const pullRequest = payload.pullRequest;

  return '' +
`You were assigned to review pull request:
  ${pullRequest.title} — ${pullRequest.html_url}`;
}

export default function startNotification(transport, payload) {
  const reviewers = payload.pullRequest.review.reviewers;

  reviewers.forEach(member => {
    transport.send(member.login, message(payload));
  });
}
