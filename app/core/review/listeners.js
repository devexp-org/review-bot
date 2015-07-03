import events from 'app/core/events';

export default {
    init(options) {
        Object.keys(options.listeners).forEach((eventName) => {
            options.listeners[eventName].forEach((handler) => {
                events.on(eventName, handler);
            });
        });
    }
};
