export default {
    transport: require('app/modules/jabber'),
    events: {
        'review:started': require('app/modules/review_notifications/started')
    }
};
