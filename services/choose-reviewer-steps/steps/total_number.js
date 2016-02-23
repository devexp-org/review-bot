/**
 * Create review total number processor.
 *
 * @param {Object} options
 * @param {Number} options.max - how many reviewers should be suggested.
 *
 * @return {Function}
 */
export default function totalNumberService(options) {
  const max = options.max;

  /**
   * Take defined amount of team member for review.
   *
   * @param {Review} review
   *
   * @return {Review} review
   */
  function totalNumber(review) {
    review.team = review.team.slice(0, max);

    return Promise.resolve(review);
  }

  return totalNumber;
}
