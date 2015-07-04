/**
 * Creates review total number processor.
 *
 * @param {Number} max - how many reviewers should be suggested.
 *
 * @returns {Function}
 */
export default function reviewTotalNumberCreator(max) {
    /**
     * Takes defined amount of team member for review.
     *
     * @param {Object} review
     *
     * @returns {Promise}
     */
    return function reviewTotalNumber(review) {
        return new Promise((resolve) => {
            review.team = review.team.slice(0, max);

            resolve(review);
        });
    };
}
