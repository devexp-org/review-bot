export default function commandLogFactory(imports) {
  const { logger } = imports;

  return function commandLog(commandName, command, payload) {
    const { pullRequest, comment } = payload;

    logger.info(
      '%s — "%s" [%s – %s] %s.\nFull command is: "%s".',
      comment.user.login,
      commandName,
      pullRequest.number,
      pullRequest.title,
      pullRequest.html_url,
      command
    );
  };
}
