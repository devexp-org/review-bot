import _ from 'lodash';

/**
 * Create review `load` processor.
 *
 * @param {Object} options
 * @param {Number} options.max - max rank which will be substract for amount of active reviews.
 * @param {Object} imports
 *
 * @return {Function}
 */
export default function loadService(options, imports) {

  const max = options.max;

  function load(review, payload) {

    const promise = [];
    const pullRequestModel = imports.model.get('pull_request');

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
          .flatten()
          .uniq('id')
          .forEach(activeReview => {
            activeReview.review.reviewers.forEach(reviewer => {
              reviewer = _.find(review.team, { login: reviewer.login });

              if (reviewer) {
                reviewer.rank -= max;
              }
            });
          });

        return review;
      });

  }

  return load;
}
