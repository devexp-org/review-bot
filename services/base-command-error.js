/**
 * Base cmmand error service
 *
 * @param {Object}   options
 * @param {String[]} options.events - emit error event.
 * @param {Object}   imports
 *
 * @return {Promise}
 */
export default function (options, imports) {
  const events = imports.events;
  const errorEventName = options.event;

  const service = function (errors, command, payload) {
    return Object.assign({
      command,
      pullRequest: payload.pullRequest,
      comment: payload.comment,

      emitError(message) {
        events.emit(errorEventName, {
          message,
          command: this.command,
          pullRequest: this.pullRequest,
          user: this.comment.user
        });

        return Promise.reject(new Error(message));
      }
    }, errors);
  };

  return Promise.resolve({ service });
}
