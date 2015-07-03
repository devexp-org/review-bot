// TODO: Catch errors

import * as config from 'app/core/config';

export default {
    approveCount: 1,
    reducers: [
        require('app/plugins/review-github-org-team')(config.load('github_org_team')),
        require('app/plugins/review-remove-author')(),
        require('app/plugins/review-remove-already-reviewers')(),
        require('app/plugins/review-random')(15),
        require('app/plugins/review-sort')(),
        require('app/plugins/review-total-number')(2)
    ]
};
