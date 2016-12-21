import { remove, isEmpty, includes } from 'lodash';
import AbstractReviewStep from '../step';

export class IgnoreReviewStep extends AbstractReviewStep
{

  /**
   * @override
   */
  name() {
    return 'ignore';
  }

  /**
   * @override
   */
  config() {
    return {
      list: {
        type: 'string'
      }
    };
  }

  /**
   * Removes reviewers which login is match to one in the list.
   *
   * @override
   *
   * @param {Review} review
   * @param {Object} options
   * @param {Array}  [options.list] - list of logins which should be ignored
   *
   * @return {Promise.<Review>}
   */
  process(review, options) {
    const list = options && options.list || [];

    if (isEmpty(list) || isEmpty(review.members)) {
      return Promise.resolve(review);
    }

    remove(review.members, (member) => includes(list, member.login));

    return Promise.resolve(review);
  }

}

/**
 * Create review `ignore` step.
 *
 * @return {AbstractReviewStep}
 */
export default function setup() {
  return new IgnoreReviewStep();
}
