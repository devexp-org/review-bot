/**
 * Creates review random processor.
 *
 * @param {Number} max - max random rank
 *
 * @returns {Function}
 */
export default function reviewRandomCreator(max) {
    /**
     * Adds random rank to every team member.
     *
     * @param {Object} review
     *
     * @returns {Promise}
     */
    return function reviewRandom(review) {
        return new Promise((resolve) => {
            review.team.forEach((member) => {
                member.rank += Math.floor(Math.random() * (max - 1));
            });

            resolve(review);
        });
    };
}
