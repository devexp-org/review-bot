module.exports = {
    commands: [
        {
            test: /^\/start/,
            handlers: [require('app/plugins/review_commands/start')()]
        },
        {
            test: /^\/ok/,
            handlers: [require('app/plugins/review_commands/ok')()]
        },
        {
            test: /^\/busy/,
            handlers: [require('app/plugins/review_commands/busy')()]
        }
    ],

    events: ['github:issue_comment']
};
