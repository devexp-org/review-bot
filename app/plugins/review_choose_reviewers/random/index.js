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
     * @param {Object} review
     *
     * @returns {Promise}
     */
    return function reviewRandom(review) {
        return new Promise(function (resolve) {
            review.team.forEach(function (member) {
                member.rank += Math.floor(Math.random() * (max - 1));
            });

            resolve(review);
        });
    };
};
