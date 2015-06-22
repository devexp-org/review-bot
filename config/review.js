import * as config from 'app/core/config';

export default {
    reducers: [
        require('app/plugins/review-simple-team')(config.load('team')),
        require('app/plugins/review-remove-author')(),
        require('app/plugins/review-random')(15),
        require('app/plugins/review-sort')(),
        require('app/plugins/review-total-number')(2)
    ]
};
