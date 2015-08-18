'use strict';

/**
 * Create review `sort` processor.
 *
 * @return {Function}
 */
export default function sort() {

  /**
   * Sort reviewers by rank.
   *
   * @param {Review} review
   *
   * @return {Review} review
   */
  return function sortStep(review) {
    review.team = review.team.sort((a, b) => {
      if (a.rank > b.rank) {
        return -1;
      } else if (b.rank > a.rank) {
        return 1;
      } else {
        return 0;
      }
    });

    return Promise.resolve(review);
  };

}
