/**
 * Sort reviewers by rank.
 *
 * @param {Review} review
 *
 * @return {Review} review
 */
function sort(review) {
  review.team = review.team.sort((a, b) => {
    if (a.rank > b.rank) {
      return -1;
    } else if (b.rank > a.rank) {
      return 1;
    } else {
      return 0;
    }
  });

  return Promise.resolve(review);
}

export default function sortService() {
  return sort;
}
