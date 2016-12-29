import { forEach } from 'lodash';
import AbstractReviewStep from '../step';

export class RandomReviewStep extends AbstractReviewStep
{

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
   * Adds random rank to every candidate.
   *
   * @override
   *
   * @param {Review} review
   * @param {Object} options
   * @param {Number} [options.max] - max random rank
   *
   * @return {Promise.<Review>}
   */
  process(review, options) {
    const max = options.max || 1;

    forEach(review.members, (member) => {
      member.rank += Math.floor(Math.random() * max) + 1;
    });

    return Promise.resolve(review);
  }

}

/**
 * Create review `random` step.
 *
 * @return {AbstractReviewStep}
 */
export default function setup() {
  return new RandomReviewStep();
}
