import _ from 'lodash';
import events from 'app/modules/events';

let commands = {};

/**
 * Dispatch commands to handlers.
 *
 * @param {Object} payload - github webhook handler payload.
 */
function commandsDispatcher(payload) {
    let cmd;
    const commentBody = _.get(payload, ['comment', 'body']);

    _.forEach(commentBody.split('\r\n'), comment => {
        _.forEach(commands, command => {
            if (comment.match(command.test)) {
                cmd = _.compact(comment.replace(command.test, '').split(' '));
                cmd = cmd.map(c => c.toLowerCase());

                _.forEach(command.handlers, handler => {
                    handler(cmd, payload);
                });
            }
        });
    });
}

/**
 * Creates commands dispatcher.
 *
 * @param {Object} options
 * @param {Object} options.commands - list of handlers for command
 * @param {String[]} options.events - name of events for subscribe to.
 */
export default function commandsDispatcherCreator(options) {
    commands = options.commands;

    options.events.forEach(event => { events.on(event, commandsDispatcher); });
}
