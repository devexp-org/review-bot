function message({ pullRequest }) {
    return `Your were assigned to review pull request:

${pullRequest.title} — ${pullRequest.html_url}`;
}

export default function startedNotification(transport, payload) {
    payload.review.reviewers.forEach(r => transport.sendMessage(r.login, message(payload)));
}
