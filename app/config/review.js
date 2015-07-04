import * as config from 'app/core/config';

export default {
    approveCount: 2,
    reducers: [
        require('app/plugins/review-github-org-team')(config.load('github_org_team')),
        require('app/plugins/review-remove-author')(),
        require('app/plugins/review-remove-already-reviewers')(),
        require('app/plugins/review-random')(15),
        require('app/plugins/review-sort')(),
        require('app/plugins/review-total-number')(2)
    ],
    listeners: {
        'github:pull_request:opened': [require('app/plugins/review-autoassign')()],
        'github:issue_comment': [
            require('app/plugins/review-commands/dispatcher')({
                commands: {
                    'start': [require('app/plugins/review-commands/start')()],
                    'ok': [require('app/plugins/review-commands/ok')()]
                },
                aliases: {}
            })
        ]
    }
};
