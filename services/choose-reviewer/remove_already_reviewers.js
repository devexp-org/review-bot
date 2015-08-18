'use strict';

import { isEmpty } from 'lodash';

/**
 * Create review `removeAlreadyReviewers` processor.
 *
 * @return {Function}
 */
export default function removeAlreadyReviewers() {

  /**
   * Remove team members which are already reviewers.
   *
   * @param {Review} review
   *
   * @return {Review} review
   */
  return function removeAlreadyReviewersStep(review) {
    const reviewers = review.pullRequest.get('review.reviewers');

    if (isEmpty(reviewers)) {
      return Promise.resolve(review);
    }

    review.team = review.team.filter(member => {
      let keep = true;

      reviewers.forEach(reviewer => {
        if (reviewer.login === member.login) {
          keep = false;
        }
      });

      return keep;
    });

    return Promise.resolve(review);
  };
}
