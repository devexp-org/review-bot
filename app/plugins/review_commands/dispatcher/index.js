var _ = require('lodash');
var events = require('app/core/events');

var commands = {};
var command_regex;

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
        cmd = cmd.map(function (c) { return c.toLowerCase(); });

        _.forEach(commands[cmd[0]], function (processor) {
            processor(cmd, payload);
        });
    }
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
    command_regex = options.regex;

    options.events.forEach(function (event) { events.on(event, commandsDispatcher); });
};
