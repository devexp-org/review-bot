module.exports = {
    commands: [
        {
            test: /^\/start(\W|$)/i,
            handlers: [require('app/modules/review_commands/start')()]
        },
        {
            test: /^\/ok$|^ok$|^ок$|^\/ок$/i,
            handlers: [require('app/modules/review_commands/ok')()]
        },
        {
            test: /^\/!ok$|^!ok$|^\/!ок$|^!ок$/i,
            handlers: [require('app/modules/review_commands/not_ok')()]
        },
        {
            test: /^\/busy(\W|$)/i,
            handlers: [require('app/modules/review_commands/busy')()]
        },
        {
            test: /^\/change(\W|$)/i,
            handlers: [require('app/modules/review_commands/change')()]
        }
    ],

    events: ['github:issue_comment']
};
