require('babel/register');

var path = require('path');
var defer = require('config/defer').deferConfig;

var complexity = require('app/modules/complexity');
//var githubModelAddons = require('app/modules/github/pull_request_model_addons');

module.exports = {
    badges: {
        url: 'http://localhost/badges/',
        style: 'flat'
    },
    client: {
        status_to_color: {
            'open': 'success',
            'closed': 'danger',
            'notstarted': 'default',
            'inprogress': 'warning',
            'complete': 'success'
        }
    },
    commands: {
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
    },
    commiters: {
        commitsCount: 10,
        filesToCheck: 5,
        since: [4, 'month'],
        ignore: [
            'app/config'
        ]
    },
    github: {
        version: '3.0.0',
        debug: false,
        protocol: 'https',
        host: 'api.github.com',
        timeout: 5000,
        headers: {
            'user-agent': 'Devexp-GitHub-App'
        },
        authenticate: {
            type: 'oauth',
            token: '0a3e66736adb7b51ca85b86b64eebdf1a9c79525'
        },
        content: {
            start: '<section id="info"><hr><span id="devexp-content-start"></span>',
            end: '<span id="devexp-content-end"></span>',
            regex: /<hr><span id="devexp-content-start"><\/span>([\s\S]*)<span id="devexp-content-end"><\/span>/g
        }
    },
    jabber: {
        auth: {
            login: 'bro@yandex-team.ru',
            pass: 'k2c9md93'
        }
    },
    models: {
        extenders: {
            'PullRequest': [
                complexity.extender()
                //githubModelAddons.extender()
            ]
        },

        hooks: {
            'PullRequest': {
                'preSave': [
                    complexity.hook()
                    //githubModelAddons.hook()
                ]
            }
        }
    },
    mongoose: {
        host: 'mongodb://localhost/devexp-dev'
    },
    notifications: {
        transport: '',
        //transport: require('app/modules/jabber'),
        events: {
            'review:started': require('app/modules/review_notifications/started')
        }
    },
    review: {
        approveCount: 2,
        processors: defer(function(cfg) {
            return [
                require('app/modules/review_choose_reviewers/remove_author')(),
                require('app/modules/review_choose_reviewers/remove_already_reviewers')(),
                require('app/modules/review_choose_reviewers/commiters')(4, cfg.commiters),
                require('app/modules/review_choose_reviewers/random')(5),
                require('app/modules/review_choose_reviewers/load')(1),
                require('app/modules/review_choose_reviewers/sort')(),
                require('app/modules/review_choose_reviewers/total_number')(2)
            ];
        })
    },
    server: {
        staticBase: '/public',
        staticPath: path.join(__dirname, '..', '..', '..', 'public'),
        port: process.env.NODE_PORT || 3000
    },
    team: {
        'devexp-org/devexp': {
            transport: require('app/modules/team_transport_github'),
            params: {
                org: 'devexp-org',
                team: 'owners'
            }
        }
    }
};

