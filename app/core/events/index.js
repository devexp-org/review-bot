var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();

module.exports = {
    /**
     * Setup listeners for internal events.
     *
     * @param {Object} options
     * @param {Object} options.listeners
     */
    init: function init(options) {
        // TODO: aliases
        Object.keys(options.listeners).forEach(function (eventName) {
            options.listeners[eventName].forEach(function (handler) {
                this.on(eventName, handler);
            });
        });
    },

    /**
     * Subscribes on event.
     *
     * @param {String} event - event name.
     * @param {Function} callback - event handler.
     *
     * @returns {this}
     */
    on: function on(event, callback) {
        ee.on(event, callback);

        return this;
    },

    /**
     * Unsubscribes from event.
     *
     * @param {String} event - event name.
     * @param {Function} callback - event handler.
     *
     * @returns {this}
     */
    off: function off(event, callback) {
        ee.removeListener(event, callback);

        return this;
    },

    /**
     * Emits event with data.
     *
     * @returns {this}
     */
    emit: function emit() {
        ee.emit.apply(ee, arguments);

        return this;
    }
};
