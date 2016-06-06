import { chain, forEach, isEmpty } from 'lodash';

/**
 * Remove members which are already reviewers.
 *
 * @param {Review} review
 *
 * @return {Promise.<Review>} review
 */
function removeAlreadyReviewers(review) {
  const reviewers = review.pullRequest.get('review.reviewers');

  if (isEmpty(reviewers)) {
    return Promise.resolve([]);
  }

  const result = chain(review.members)
    .filter(member => {
      let remove = false;

      forEach(reviewers, (reviewer) => {
        if (reviewer.login === member.login) {
          remove = true;
        }
      });

      return remove;
    })
    .map(member => {
      return {
        rank: -Infinity,
        login: member.login
      };
    })
    .value();

  return Promise.resolve(result);
}

/**
 * Create review `remove_already_reviewers` processor.
 *
 * @return {Function}
 */
export default function setup() {
  return removeAlreadyReviewers;
}
