/**
 * Creates review random processor.
 *
 * @param {Number} max - max random rank
 *
 * @returns {Function}
 */
module.exports = function reviewRandomCreator(max) {
    /**
     * Adds random rank to every team member.
     *
     * @param {Review} review
     *
     * @returns {Review} review
     */
    return function reviewRandom(review) {
        review.team.forEach(function (member) {
            member.rank += Math.floor(Math.random() * (max + 1));
        });

        return review;
    };
};
