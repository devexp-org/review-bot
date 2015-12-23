/**
 * Remove author from team.
 *
 * @param {Review} review
 *
 * @return {Promise}
 */
function removeAuthor(review) {
  const pullAuthor = review.pullRequest.user.login;

  review.team = review.team.filter(member => {
    return member.login !== pullAuthor;
  });

  return Promise.resolve(review);
}

export default function removeAuthorService() {
  return removeAuthor;
}
