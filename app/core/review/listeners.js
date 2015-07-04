import events from 'app/core/events';

export default {
    /**
     * Setup listeners for internal events. Mostly from github module.
     *
     * @param {Object} options
     */
    init(options) {
        Object.keys(options.listeners).forEach((eventName) => {
            options.listeners[eventName].forEach((handler) => {
                events.on(eventName, handler);
            });
        });
    }
};
