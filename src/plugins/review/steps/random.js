import { chain } from 'lodash';

/**
 * Add random rank to every team member.
 *
 * @param {Review} review
 * @param {Object} options
 * @param {Number} options.max - max random rank
 *
 * @return {Review} review
 */
function random(review, options) {
  const max = options.max;

  let reviewers = chain(review.members)
    .map(member => {
      const rank = Math.floor(Math.random() * max) + 1;
      return { login: member.login, rank };
    })
    .filter(member => member.rank > 0)
    .value();

  return Promise.resolve(reviewers);
}

/**
 * Create review `random` processor.
 *
 * @return {Function}
 */
export default function setup() {
  return random;
}
