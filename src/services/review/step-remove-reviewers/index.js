import { remove, forEach, isEmpty } from 'lodash';

import AbstractReviewStep from '../step';

export class RemoveReviewersReviewStep extends AbstractReviewStep {

  /**
   * Removes candidates which are already reviewers.
   *
   * @override
   *
   * @param {Review} review
   *
   * @return {Promise.<Review>}
   */
  process(review) {

    const reviewers = review.pullRequest.get('review.reviewers');

    if (isEmpty(reviewers)) {
      return Promise.resolve(review);
    }

    remove(review.members, (member) => {
      let keep = true;

      forEach(reviewers, (reviewer) => {
        if (reviewer.login === member.login) {
          keep = false;
        }
      });

      return !keep;
    });

    return Promise.resolve(review);

  }

}

/**
 * Create review `remove_reviewers` step.
 *
 * @return {AbstractReviewStep}
 */
export default function setup() {
  return new RemoveReviewersReviewStep();
}
