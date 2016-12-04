import { map, chain, find, forEach, isEmpty } from 'lodash';

/**
 * Create review `load` processor.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {Function}
 */
export default function setup(options, imports) {

  const PullRequestModel = imports['pull-request-model'];

  /**
   * Subtract rank from reviewers which aleady has active review.
   *
   * @param {Review} review
   * @param {Object} options
   * @param {Number} options.max - max rank which will be subtract for amount of active reviews.
   *
   * @return {Promise.<Review>}
   */
  function load(review, options) {

    const max = options.max;

    const promise = [];

    if (isEmpty(review.members)) {
      return Promise.resolve(review);
    }

    forEach(review.members, (member) => {
      promise.push(PullRequestModel.findInReviewByReviewer(member.login));
    });

    return Promise.all(promise)
      .then(openReviews => {
        const members = {};
        const reviews = chain(openReviews).flatten().uniq('id').value();

        forEach(reviews, activeReview => {
          forEach(activeReview.review.reviewers, (reviewer) => {
            reviewer = find(review.members, { login: reviewer.login });

            if (reviewer) {
              if (!members[reviewer.login]) {
                members[reviewer.login] = 0;
              }

              members[reviewer.login] -= max;
            }
          });
        });

        return map(members, (rank, login) => { return { login, rank }; });
      });

  }

  return load;
}
