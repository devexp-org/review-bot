var complexity = require('app/plugins/complexity');
var githubModelAddons = require('app/core/github/pull_request_model_addons');

module.export = {
    extenders: {
        'PullRequest': [
            complexity.extender(),
            githubModelAddons.extender()
        ]
    },

    hooks: {
        'PullRequest': {
            'preSave': [
                complexity.hook(),
                githubModelAddons.hook()
            ]
        }
    }
};
