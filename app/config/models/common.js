var complexity = require('app/modules/complexity');
var githubModelAddons = require('app/modules/github/pull_request_model_addons');

module.exports = {
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
