export default {
    reducers: [
        require('app/plugins/review-simple-team-reducer')(),
        require('app/plugins/review-random-reducer')(15),
        require('app/plugins/review-sort-reducer')(),
        require('app/plugins/review-total-number-reducer')(2)
    ]
};
