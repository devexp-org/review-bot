import _ from 'lodash';

export default function removeAlreadyReviewersCreator() {

    /**
     * Removes team members which are already reviewers.
     *
     * @param {Review} review
     *
     * @returns {Review} review
     */
    return function removeAlreadyReviewers(review) {
        var reviewers = review.pull.review.reviewers;

        if (_.isEmpty(reviewers)) return review;

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

        return Promise.resolve(review);
    };
}
