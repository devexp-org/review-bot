'use strict';

import _ from 'lodash';

/**
 * Create review `load` processor.
 *
 * @param {Object} options
 * @param {Number} options.max - max rank which will be substract for amount of active reviews.
 *
 * @return {Function}
 */
export default function load(options) {

  const max = options.max;

  /**
   * Lower rank if member has some active reviews.
   *
   * @param {Review} review
   * @param {Object} payload
   *
   * @return {Promise}
   */
  return function loadStep(review, payload) {
    const promise = [];
    const pullRequestModel = payload.pullRequestModel;

    if (_.isEmpty(review.team)) {
      return Promise.resolve(review);
    }

    review.team.forEach(member => {
      promise.push(pullRequestModel.findOpenReviewsByUser(member.login));
    });

    return Promise
      .all(promise)
      .then(openReviews => {
        _(openReviews)
          .uniq(item => item.id)
          .first()
          .forEach(activeReview => {
            activeReview.review.reviewers.forEach(reviewer => {
              reviewer = _.find(review.team, { login: reviewer.login });

              reviewer.rank -= max;
            });
          });

        return review;
      });
  };

}
