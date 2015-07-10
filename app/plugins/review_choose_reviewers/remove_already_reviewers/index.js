var _ = require('lodash');

module.exports = function removeAlreadyReviewersCreator() {
    /**
     * Removes team members which are already reviewers.
     *
     * @param {Object} review
     *
     * @returns {Promise}
     */
    return function removeAlreadyReviewers(review) {
        return new Promise(function (resolve) {
            var reviewers = review.pull.review.reviewers;

            if (_.isEmpty(reviewers)) {
                resolve(review);
            }

            review.team = _.filter(review.team, function (member) {
                var keep = true;

                reviewers.forEach(function (reviewer) {
                    if (reviewer.login === member.login) {
                        keep = false;
                        return false;
                    }
                });

                return keep;
            });

            resolve(review);
        });
    };
};
