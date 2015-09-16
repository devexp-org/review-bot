function message(payload) {
  const { command, message: msg, pullRequest } = payload;

  return '' +
`Command "${command}" error: ${msg}

${pullRequest.title} — ${pullRequest.html_url}`;
}

export default function commandErrorNotification(transport, payload) {
  const user = payload.user;

  transport.send(user.login, message(payload));
}
