import * as complexity from 'app/plugins/complexity';

export default {
    extenders: {
        'PullRequest': [
            complexity.extender()
        ]
    },

    hooks: {
        'PullRequest': {
            'preSave': [
                complexity.hook()
            ]
        }
    }
};
