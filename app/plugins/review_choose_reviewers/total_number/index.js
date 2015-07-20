/**
 * Creates review total number processor.
 *
 * @param {Number} max - how many reviewers should be suggested.
 *
 * @returns {Function}
 */
module.exports = function reviewTotalNumberCreator(max) {

    /**
     * Takes defined amount of team member for review.
     *
     * @param {Review} review
     *
     * @returns {Review} review
     */
    return function reviewTotalNumber(review) {
        review.team = review.team.slice(0, max);

        return Promise.resolve(review);
    };
};
