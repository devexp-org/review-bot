'use strict';

function message(payload) {
  const pullRequest = payload.pullRequest;

  return `Review completed:

${pullRequest.title} — ${pullRequest.html_url}`;
}

export default function completeNotification(transport, payload) {
  const pullRequest = payload.pullRequest;

  transport.send(pullRequest.user.login, message(payload));
}
