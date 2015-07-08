export default {
    regex: /^\/review\s+/i,

    commands: {
        'start': [require('app/plugins/review_commands/start')()],
        'ok': [require('app/plugins/review_commands/ok')()]
    },

    events: ['github:issue_comment']
}
