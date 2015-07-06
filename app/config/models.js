import * as complexity from 'app/plugins/complexity';
import * as githubContent from 'app/core/github/pull_request_model_addons';

export default {
    extenders: {
        'PullRequest': [
            complexity.extender(),
            githubContent.extender()
        ]
    },

    hooks: {
        'PullRequest': {
            'preSave': [
                complexity.hook(),
                githubContent.hook()
            ]
        }
    }
};
