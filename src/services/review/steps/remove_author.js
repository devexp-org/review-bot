import { find } from 'lodash';

/**
 * Remove author from review.
 *
 * @param {Review} review
 *
 * @return {Promise.<Review>}
 */
function removeAuthor(review) {
  let result = [];
  const author = review.pullRequest.get('user.login');
  const member = find(review.members, { login: author });

  if (member) {
    result = [{ login: member.login, rank: -Infinity }];
  }

  return Promise.resolve(result);
}

/**
 * Create review `remove_author` processor.
 *
 * @return {Function}
 */
export default function setup() {
  return removeAuthor;
}
