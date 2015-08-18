'use strict';

/**
 * Create review random processor.
 *
 * @param {Object} options
 * @param {Number} options.max - max random rank
 *
 * @return {Function}
 */
export default function random(options) {

  const max = options.max;

  /**
   * Add random rank to every team member.
   *
   * @param {Review} review
   *
   * @return {Review} review
   */
  return function randomStep(review) {
    review.team.forEach(member => {
      member.rank += Math.floor(Math.random() * (max + 1));
    });

    return Promise.resolve(review);
  };

}
