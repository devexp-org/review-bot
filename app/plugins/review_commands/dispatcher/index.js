import _ from 'lodash';
import events from 'app/core/events';

var commands = {},
    command_regex;

/**
 * Dispatch commands to handlers.
 *
 * @param {Object} payload - github webhook handler payload.
 */
function commandsDispatcher(payload) {
    var comment = _.get(payload, ['comment', 'body']),
        cmd;

    if (comment && comment.match(command_regex)) {
        cmd = _.compact(comment.replace(command_regex, '').split(' '));
        cmd = cmd.map(c => c.toLowerCase());

        _.forEach(commands[cmd[0]], (processor) => {
            processor(cmd, payload);
        });
    }
};

/**
 * Creates commands dispatcher.
 *
 * @param {Object} options
 * @param {Object} options.commands - list of handlers for command
 * @param {RegExp} options.regex - regex wich match command
 * @param {String[]} options.events - name of events for subscribe to.
 */
export default function commandsDispatcherCreator(options) {
    commands = options.commands;
    command_regex = options.regex;

    options.events.forEach(event => events.on(event, commandsDispatcher));
}
