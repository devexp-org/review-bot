import * as complexity from 'app/plugins/complexity';
import * as githubModelAddons from 'app/core/github/pull_request_model_addons';

export default {
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
