function message(payload) {
  const pullRequest = payload.pullRequest;

  return '' +
`Your were assigned to review pull request:
  ${pullRequest.title} — ${pullRequest.html_url}`;
}

export default function startNotification(transport, payload) {
  const reviewers = payload.review.reviewers;

  reviewers.forEach(member => {
    transport.send(member.login, message(payload));
  });
}
