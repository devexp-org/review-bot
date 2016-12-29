import { remove, matches } from 'lodash';
import AbstractReviewStep from '../step';

export class RemoveAuthorReviewStep extends AbstractReviewStep
{

  /**
   * Removes author from review.
   *
   * @override
   *
   * @param {Review} review
   *
   * @return {Promise.<Review>}
   */
  process(review) {
    const author = review.pullRequest.get('user.login');
    remove(review.members, matches({ login: author }));

    return Promise.resolve(review);
  }

}

/**
 * Create review `remove_author` step.
 *
 * @return {AbstractReviewStep}
 */
export default function setup() {
  return new RemoveAuthorReviewStep();
}
