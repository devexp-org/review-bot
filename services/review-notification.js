'use strict';

/**
 * Notification service
 *
 * @param {Object}   options
 * @param {Object}   options.transport - notification transport.
 * @param {String[]} options.events - map events to notifications.
 * @param {Object}   imports
 *
 * @return {Promise}
 */
export default function (options, imports) {

  const events = imports.events;
  const transport = imports[options.transport];

  Object
    .keys(options.events)
    .forEach(event => {
      const notify = imports.requireDefault(options.events[event]);

      events.on(event, (payload) => {
        notify(transport, payload);
      });
    });

  return Promise.resolve({ service: {} });
}

