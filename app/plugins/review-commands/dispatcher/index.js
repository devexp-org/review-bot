import _ from 'lodash';

const COMMAND_REGEX = /^\/review\s+/i;

/**
 * Creates commands dispatcher.
 *
 * @param {Object} options
 *
 * @returns {Function}
 */
export default function commandsDispatcherCreator(options) {
    var commands = options.commands;

    /**
     * Dispatch commands to handlers.
     *
     * @param {Object} payload - github webhook handler payload.
     */
    return function commandsDispatcher(payload) {
        var comment = _.get(payload, ['comment', 'body']),
            cmd;

        if (comment && comment.match(COMMAND_REGEX)) {
            cmd = _.compact(comment.replace(COMMAND_REGEX, '').split(' '));
            cmd = cmd.map(c => c.toLowerCase());

            _.forEach(commands[cmd[0]], (processor) => {
                processor(cmd, payload);
            });
        }
    };
}
