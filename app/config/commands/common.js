var config = require('app/core/config');

// TODO: Aliases
module.exports = {
    commands: [
        {
            test: /^\/start\W/,
            handlers: [require('app/plugins/review_commands/start')()]
        },
        {
            test: /^\/ok$|^ok$/,
            handlers: [require('app/plugins/review_commands/ok')()]
        },
        {
            test: /^\/!ok$/,
            handlers: [require('app/plugins/review_commands/not_ok')()]
        },
        {
            test: /^\/busy\W/,
            handlers: [require('app/plugins/review_commands/busy')()]
        },
        {
            test: /^\/change\W/,
            handlers: [require('app/plugins/review_commands/change')({
                getTeam: require('app/plugins/review_choose_reviewers/github_org_team')(config.load('github_org_team'))
            })]
        }
    ],

    events: ['github:issue_comment']
};
