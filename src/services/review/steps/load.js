import { chain, find, forEach, isEmpty } from 'lodash';
import AbstractReviewStep from '../step';

export class LoadReviewStep extends AbstractReviewStep
{

  /**
   * @constructor
   *
   * @param {PullRequestModel} PullRequestModel
   */
  constructor(PullRequestModel) {
    super();

    this.PullRequestModel = PullRequestModel;
  }

  /**
   * @override
   */
  name() {
    return 'load';
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
   * Subtracts rank from reviewers which aleady has active review.
   *
   * @override
   *
   * @param {Review} review
   * @param {Object} options
   * @param {Number} [options.max] - max rank which will be subtract for amount of active reviews.
   *
   * @return {Promise.<Review>}
   */
  process(review, options) {
    const max = options.max;

    const promise = [];

    if (isEmpty(review.members)) {
      return Promise.resolve(review);
    }

    forEach(review.members, (member) => {
      promise.push(this.PullRequestModel.findInReviewByReviewer(member.login));
    });

    return Promise.all(promise)
      .then(openReviews => {
        const reviews = chain(openReviews).flatten().uniq('id').value();

        forEach(reviews, (activeReview) => {
          forEach(activeReview.review.reviewers, (reviewer) => {
            reviewer = find(review.members, { login: reviewer.login });

            if (reviewer) {
              reviewer.rank -= max;
            }
          });
        });

        return review;
      });
  }

}

/**
 * Create review `load` step.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {AbstractReviewStep}
 */
export default function setup(options, imports) {
  const PullRequestModel = imports.model('pull_request');

  return new LoadReviewStep(PullRequestModel);
}
