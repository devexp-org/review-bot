module.exports = {
    notifications: {
        transport: '',
        events: {
            'review:started': require('app/modules/review_notifications/started')
        }
    }
};
