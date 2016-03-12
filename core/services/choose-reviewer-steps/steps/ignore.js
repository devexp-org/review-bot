import { reject, isEmpty, includes } from 'lodash';

/**
 * Review ignore step - removes reviewers which login match to one in the list.
 *
 * @param {Object} options
 * @param {Array} options.list - list of logins which should be ignored
 *
 * @return {Promise}
 */
export default function ignoreService(options = {}) {
  const list = options.list || [];

  function ignore(review, payload) {
    if (isEmpty(review.team) || isEmpty(list)) {
      return Promise.resolve(review);
    }

    review.team = reject(review.team, member => includes(list, member.login));

    return Promise.resolve(review);
  }

  return ignore;
}
