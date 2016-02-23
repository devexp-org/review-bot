/**
 * Create review random processor.
 *
 * @param {Object} options
 * @param {Number} options.max - max random rank
 *
 * @return {Function}
 */
export default function randomService(options) {
  const max = options.max;

  /**
   * Add random rank to every team member.
   *
   * @param {Review} review
   *
   * @return {Review} review
   */
  function random(review) {
    review.team.forEach(member => {
      member.rank += Math.floor(Math.random() * (max + 1));
    });

    return Promise.resolve(review);
  }

  return random;
}
