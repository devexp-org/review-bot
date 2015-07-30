import events from 'app/modules/events';

let transport;

/**
 * Dispatch messages to handlers.
 *
 * @param {Object} payload
 */
function notificationDispatcher(handler, payload) {
    handler(transport, payload);
}

/**
 * Creates notifications dispatcher.
 *
 * @param {Object} options
 * @param {Object} options.transport - notification transport.
 * @param {String[]} options.events - map events to notifications.
 */
export default function notificationsDispatcherCreator(options) {
    transport = options.transport;

    Object.keys(options.events)
        .forEach((event) => {
            events.on(event, notificationDispatcher.bind(null, options.events[event]));
        });
}
