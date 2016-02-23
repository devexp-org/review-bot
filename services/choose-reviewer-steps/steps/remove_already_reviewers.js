import { isEmpty } from 'lodash';

/**
 * Remove team members which are already reviewers.
 *
 * @param {Review} review
 *
 * @return {Review} review
 */
function removeAlreadyReviewers(review) {
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
}

export default function removeAuthorService() {
  return removeAlreadyReviewers;
}
