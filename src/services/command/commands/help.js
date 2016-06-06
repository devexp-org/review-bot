const EVENT_NAME = 'review:command:help';

export default function setup(options, imports) {

  const { events } = imports;

  /**
   * Handle '/help' command.
   *
   * @param {String} command - line with user command.
   * @param {Object} payload - github webhook payload.
   *
   * @return {Promise}
   */
  const helpCommand = function helpCommand(command, payload) {
    events.emit(EVENT_NAME, payload, options.link);

    return Promise.resolve(payload.pullRequest);
  };

  return helpCommand;

}
