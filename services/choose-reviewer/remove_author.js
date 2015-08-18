'use strict';

/**
 * Create review `removeAuthor` processor.
 *
 * @return {Function}
 */
export default function removeAuthor() {

  /**
   * Remove author from team.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  return function removeAuthorStep(review) {
    const pullAuthor = review.pullRequest.user.login;

    review.team = review.team.filter(member => {
      return member.login !== pullAuthor;
    });

    return Promise.resolve(review);
  };
}
