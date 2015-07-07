export default {
    listeners: {
        'github:pull_request:opened': [require('app/plugins/review_autoassign')()],
        'github:issue_comment': [
            require('app/plugins/review_commands/dispatcher')({
                commands: {
                    'start': [require('app/plugins/review_commands/start')()],
                    'ok': [require('app/plugins/review_commands/ok')()]
                }
            })
        ]
    }
}
