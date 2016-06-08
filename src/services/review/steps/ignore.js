import { chain, isEmpty, includes } from 'lodash';

/**
 * Removes reviewers which login is match to one in the list.
 *
 * @param {Review} review
 * @param {Object} options
 * @param {Array}  [options.list] - list of logins which should be ignored
 *
 * @return {Promise.<Review>}
 */
function ignore(review, options) {
  const list = options && options.list || [];

  if (isEmpty(list) || isEmpty(review.members)) {
    return Promise.resolve([]);
  }

  const ignored = chain(review.members)
      .filter(member => includes(list, member.login))
      .map(member => {
        return { login: member.login, rank: -Infinity };
      })
      .value();

  return Promise.resolve(ignored);
}

/**
 * Create review `ignore` processor.
 *
 * @return {Promise.<Review>}
 */
export default function setup() {
  return ignore;
}
