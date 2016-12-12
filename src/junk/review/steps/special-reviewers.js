/**
 * Up or down reviewers rank for project config
 * @param {Object} options
 * @param {Number} options.max - max random rank
 * @param {Object} imports
 * @return {Function}
 */
export default function specialReviewersService(options, imports) {
  const checker = imports['special-checker'];

  return checker.specialReviewers.bind(checker);
}
