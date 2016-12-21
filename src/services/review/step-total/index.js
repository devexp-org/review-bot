import { take } from 'lodash';
import AbstractReviewStep from '../step';

export class TotalReviewStep extends AbstractReviewStep
{

  /**
   * @override
   */
  name() {
    return 'total';
  }

  /**
   * @override
   */
  config() {
    return {
      max: {
        type: 'number'
      }
    };
  }

  /**
   * Take defined number of team member for review.
   *
   * @override
   *
   * @param {Review} review
   * @param {Object} options
   * @param {Number} [options.max] - how many reviewers should be suggested.
   *
   * @return {Promise.<Review>}
   */
  process(review, options) {
    let count = options.max;

    review.reviewers = take(review.members, count);

    review.approveCount = count;

    return Promise.resolve(review);
  }

}

/**
 * Create review `total` step.
 *
 * @return {AbstractReviewStep}
 */
export default function setup() {
  return new TotalReviewStep();
}
