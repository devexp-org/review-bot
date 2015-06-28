import EventEmitter from 'events';

var ee = new EventEmitter();

export default {
    on(event, callback) {
        ee.on(event, callback);

        return this;
    },

    off(event, callback) {
        ee.removeListener(event, callback);

        return this;
    },

    emit() {
        ee.emit.apply(ee, arguments);

        return this;
    }
};
