var _ = require('lodash');
var events = require('app/core/events');

var commands = {};

/**
 * Dispatch commands to handlers.
 *
 * @param {Object} payload - github webhook handler payload.
 */
function commandsDispatcher(payload) {
    var comment = _.get(payload, ['comment', 'body']);
    var cmd;

    _.forEach(commands, function (command) {
        if (comment.match(command.test)) {
            cmd = _.compact(comment.replace(command.test, '').split(' '));
            cmd = cmd.map(function (c) { return c.toLowerCase(); });

            _.forEach(command.handlers, function (handler) {
                handler(cmd, payload);
            });
        }
    });
}

/**
 * Creates commands dispatcher.
 *
 * @param {Object} options
 * @param {Object} options.commands - list of handlers for command
 * @param {RegExp} options.regex - regex wich match command
 * @param {String[]} options.events - name of events for subscribe to.
 */
module.exports = function commandsDispatcherCreator(options) {
    commands = options.commands;

    options.events.forEach(function (event) { events.on(event, commandsDispatcher); });
};
